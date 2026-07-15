use libsql::Database;
use crate::db::types::{Ingreso, TipoIngreso};
use crate::db::helpers::*;

pub async fn obtener_tipos_ingreso(db: &Database) -> Result<Vec<TipoIngreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, codigo, descripcion FROM tipos_documento_produccion ORDER BY codigo", ())
        .await.map_err(|e| e.to_string())?;

    let mut tipos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        tipos.push(TipoIngreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: row.get(1).map_err(|e| e.to_string())?,
            descripcion: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(tipos)
}
pub async fn obtener_ingresos(db: &Database) -> Result<Vec<Ingreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT
            p.id,
            p.tipo_documento_id,
            p.fecha,
            SUM(COALESCE(ppp.peso_total_neto_kg, 0)) as kg,
            SUM(COALESCE(ppp.cajas_carro_1, 0) + COALESCE(ppp.cajas_carro_2, 0) +
                COALESCE(ppp.cajas_carro_3, 0) + COALESCE(ppp.cajas_carro_4, 0)) as cajas,
            p.observaciones
         FROM partes_produccion p
         LEFT JOIN parte_produccion_producto ppp ON ppp.parte_id = p.id
         GROUP BY p.id
         ORDER BY p.fecha DESC, p.id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(Ingreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            variante_id: 0,
            tipo_ingreso_id: row.get(1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            peso_total_lote: None,
            kg: row.get(3).map_err(|e| e.to_string())?,
            cajas: row.get(4).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 5).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn obtener_ingresos_paginados(
    db: &Database, 
    limite: i64, 
    offset: i64
) -> Result<Vec<Ingreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    use libsql::Value;
    let params: Vec<Value> = vec![limite.into(), offset.into()];
    
    let mut result = conn.query(
        "SELECT
            p.id,
            p.tipo_documento_id,
            p.fecha,
            SUM(COALESCE(ppp.peso_total_neto_kg, 0)) as kg_total,
            SUM(COALESCE(ppp.cajas_carro_1,0) + COALESCE(ppp.cajas_carro_2,0) + 
                COALESCE(ppp.cajas_carro_3,0) + COALESCE(ppp.cajas_carro_4,0)) as cajas_total,
            p.observaciones
         FROM partes_produccion p
         LEFT JOIN parte_produccion_producto ppp ON ppp.parte_id = p.id
         GROUP BY p.id
         ORDER BY p.fecha DESC, p.id DESC
         LIMIT ?1 OFFSET ?2",
        params,
    ).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(Ingreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            variante_id: 0, // ya no aplica en lista, puedes usar Option<i64> = None
            tipo_ingreso_id: row.get(1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            peso_total_lote: None,
            kg: row.get(3).map_err(|e| e.to_string())?,
            cajas: row.get(4).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 5).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn contar_ingresos(db: &Database) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT COUNT(*) FROM parte_produccion_producto", ()).await.map_err(|e| e.to_string())?;
    
    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => row.get(0).map_err(|e| e.to_string()),
        None => Ok(0),
    }
}
