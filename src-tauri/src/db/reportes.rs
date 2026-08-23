use libsql::{Database, Value};

use crate::db::helpers::{get_f64, get_i64, get_optional_i64, get_optional_string};
use crate::db::types::{MateriaPrimaDia, MovimientoStock};

fn opcional_a_valor(valor: &Option<String>) -> Value {
    match valor {
        Some(v) if !v.is_empty() => Value::from(v.clone()),
        _ => Value::Null,
    }
}

// Ingresos y salidas unificados en una sola lista cronologica. Es la base de
// los reportes de produccion/salidas, kardex y trazabilidad.
//
// Importante: cada tipo se fecha distinto. Un ingreso se ubica en la fecha de
// su lote (cuando se produjo), mientras que una salida se ubica en la fecha en
// que la mercaderia salio, que no tiene por que coincidir con la del lote que
// consume. Por eso ademas se devuelve fecha_lote, que dice de que existencia
// se descontó.
const SQL_MOVIMIENTOS: &str = "SELECT * FROM (
    SELECT
        'INGRESO' AS tipo,
        pp.fecha_ingreso AS fecha,
        pp.fecha_ingreso AS fecha_lote,
        p.id AS documento_id,
        p.codigo AS documento_codigo,
        tdp.codigo AS documento_tipo,
        p.cliente AS cliente,
        pp.variante_id AS variante_id,
        vc.codigo_completo AS codigo_completo,
        vc.especie_id AS especie_id,
        vc.especie_nombre AS especie_nombre,
        vc.presentacion_id AS presentacion_id,
        vc.presentacion_nombre AS presentacion_nombre,
        vc.calidad AS calidad,
        vc.calibre AS calibre,
        CAST(COALESCE((SELECT SUM(cc.cajas)
                       FROM parte_produccion_producto_carro cc
                       WHERE cc.producto_id = pp.id), 0) AS INTEGER) AS cajas,
        CAST(COALESCE(pp.peso_total_neto_kg, 0) AS REAL) AS kg,
        p.codigo_trazabilidad AS codigo_trazabilidad
    FROM parte_produccion_producto pp
    JOIN partes_produccion p ON p.id = pp.parte_id
    JOIN variantes_completas_view vc ON vc.variante_id = pp.variante_id
    LEFT JOIN tipos_documento_produccion tdp ON tdp.id = p.tipo_documento_id
    WHERE pp.fecha_ingreso IS NOT NULL

    UNION ALL

    SELECT
        'SALIDA' AS tipo,
        c.fecha AS fecha,
        ci.fecha_ingreso AS fecha_lote,
        c.id AS documento_id,
        c.numero_control AS documento_codigo,
        tds.codigo AS documento_tipo,
        c.cliente AS cliente,
        ci.variante_id AS variante_id,
        vc.codigo_completo AS codigo_completo,
        vc.especie_id AS especie_id,
        vc.especie_nombre AS especie_nombre,
        vc.presentacion_id AS presentacion_id,
        vc.presentacion_nombre AS presentacion_nombre,
        vc.calidad AS calidad,
        vc.calibre AS calibre,
        CAST(ci.cantidad AS INTEGER) AS cajas,
        CAST(COALESCE(ci.total_kg, 0) AS REAL) AS kg,
        ci.codigo_trazabilidad AS codigo_trazabilidad
    FROM control_salida_items ci
    JOIN controles_salida c ON c.id = ci.control_salida_id
    JOIN variantes_completas_view vc ON vc.variante_id = ci.variante_id
    LEFT JOIN tipos_documento_salida tds ON tds.id = c.tipo_documento_id
) m
WHERE (?1 IS NULL OR m.fecha >= ?1)
  AND (?2 IS NULL OR m.fecha <= ?2)
  AND (?3 IS NULL OR m.especie_id = ?3)
  AND (?4 IS NULL OR m.variante_id = ?4)
ORDER BY m.fecha ASC, m.tipo DESC, m.codigo_completo ASC";

pub async fn obtener_movimientos(
    db: &Database,
    desde: Option<String>,
    hasta: Option<String>,
    especie_id: Option<i64>,
    variante_id: Option<i64>,
) -> Result<Vec<MovimientoStock>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn
        .query(
            SQL_MOVIMIENTOS,
            vec![
                opcional_a_valor(&desde),
                opcional_a_valor(&hasta),
                match especie_id {
                    Some(v) => Value::from(v),
                    None => Value::Null,
                },
                match variante_id {
                    Some(v) => Value::from(v),
                    None => Value::Null,
                },
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

    let mut movimientos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        movimientos.push(MovimientoStock {
            tipo: row.get(0).map_err(|e| e.to_string())?,
            fecha: row.get(1).map_err(|e| e.to_string())?,
            fecha_lote: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
            documento_id: get_i64(&row, 3).map_err(|e| e.to_string())?,
            documento_codigo: get_optional_string(&row, 4).map_err(|e| e.to_string())?,
            documento_tipo: get_optional_string(&row, 5).map_err(|e| e.to_string())?,
            cliente: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
            variante_id: get_i64(&row, 7).map_err(|e| e.to_string())?,
            codigo_completo: row.get(8).map_err(|e| e.to_string())?,
            especie_id: get_i64(&row, 9).map_err(|e| e.to_string())?,
            especie_nombre: row.get(10).map_err(|e| e.to_string())?,
            presentacion_id: get_i64(&row, 11).map_err(|e| e.to_string())?,
            presentacion_nombre: row.get(12).map_err(|e| e.to_string())?,
            calidad: get_optional_string(&row, 13).map_err(|e| e.to_string())?,
            calibre: get_optional_string(&row, 14).map_err(|e| e.to_string())?,
            cajas: get_i64(&row, 15).map_err(|e| e.to_string())?,
            kg: get_f64(&row, 16).map_err(|e| e.to_string())?,
            codigo_trazabilidad: get_optional_string(&row, 17).map_err(|e| e.to_string())?,
        });
    }
    Ok(movimientos)
}

// Materia prima por dia: el peso recibido de las embarcaciones de cada parte,
// mas el campo entera del documento. Se suma por separado para que el join con
// embarcaciones no multiplique el valor de entera.
const SQL_MATERIA_PRIMA: &str = "SELECT
    p.fecha AS fecha,
    p.especie_id AS especie_id,
    CAST(COALESCE(SUM(rec.kg), 0) AS REAL) AS kg_recepcion,
    CAST(COALESCE(SUM(p.entera), 0) AS REAL) AS kg_entera
FROM partes_produccion p
LEFT JOIN (
    SELECT t.parte_id AS parte_id, SUM(e.peso_total_kg) AS kg
    FROM parte_produccion_transporte t
    JOIN parte_produccion_embarcacion e ON e.transporte_id = t.id
    GROUP BY t.parte_id
) rec ON rec.parte_id = p.id
WHERE (?1 IS NULL OR p.fecha >= ?1)
  AND (?2 IS NULL OR p.fecha <= ?2)
  AND (?3 IS NULL OR p.especie_id = ?3)
GROUP BY p.fecha, p.especie_id
ORDER BY p.fecha ASC";

pub async fn obtener_materia_prima_por_fecha(
    db: &Database,
    desde: Option<String>,
    hasta: Option<String>,
    especie_id: Option<i64>,
) -> Result<Vec<MateriaPrimaDia>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn
        .query(
            SQL_MATERIA_PRIMA,
            vec![
                opcional_a_valor(&desde),
                opcional_a_valor(&hasta),
                match especie_id {
                    Some(v) => Value::from(v),
                    None => Value::Null,
                },
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

    let mut dias = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        dias.push(MateriaPrimaDia {
            fecha: row.get(0).map_err(|e| e.to_string())?,
            especie_id: get_optional_i64(&row, 1).map_err(|e| e.to_string())?,
            kg_recepcion: get_f64(&row, 2).map_err(|e| e.to_string())?,
            kg_entera: get_f64(&row, 3).map_err(|e| e.to_string())?,
        });
    }
    Ok(dias)
}
