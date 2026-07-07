use libsql::Database;
use crate::db::types::{ControlSalidaResumen, TipoSalida};
use crate::db::helpers::*;

pub async fn obtener_tipos_salida(db: &Database) -> Result<Vec<TipoSalida>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, codigo, descripcion FROM tipos_documento_salida ORDER BY codigo", ())
        .await.map_err(|e| e.to_string())?;

    let mut tipos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        tipos.push(TipoSalida {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: row.get(1).map_err(|e| e.to_string())?,
            descripcion: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(tipos)
}

pub async fn obtener_salidas(db: &Database) -> Result<Vec<ControlSalidaResumen>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT
            c.id,
            c.numero_control,
            c.fecha,
            c.cliente,
            c.tipo_documento_id,
            td.codigo,
            td.descripcion,
            c.especie_id,
            e.nombre,
            c.suma_cantidad,
            c.suma_total_kg,
            c.observaciones
         FROM controles_salida c
         JOIN tipos_documento_salida td ON td.id = c.tipo_documento_id
         JOIN especies e ON e.id = c.especie_id
         ORDER BY c.fecha DESC, c.id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut salidas = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        salidas.push(ControlSalidaResumen {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            numero_control: row.get(1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            cliente: row.get(3).map_err(|e| e.to_string())?,
            tipo_documento_id: row.get(4).map_err(|e| e.to_string())?,
            tipo_documento_codigo: row.get(5).map_err(|e| e.to_string())?,
            tipo_documento_descripcion: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
            especie_id: row.get(7).map_err(|e| e.to_string())?,
            especie_nombre: row.get(8).map_err(|e| e.to_string())?,
            suma_cantidad: row.get(9).map_err(|e| e.to_string())?,
            suma_total_kg: row.get(10).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 11).map_err(|e| e.to_string())?,
        });
    }
    Ok(salidas)
}

pub async fn obtener_salidas_paginadas(
    db: &Database,
    limite: i64,
    offset: i64,
) -> Result<Vec<ControlSalidaResumen>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    use libsql::Value;
    let params: Vec<Value> = vec![limite.into(), offset.into()];
    
    let mut result = conn.query(
        "SELECT
            c.id,
            c.numero_control,
            c.fecha,
            c.cliente,
            c.tipo_documento_id,
            td.codigo,
            td.descripcion,
            c.especie_id,
            e.nombre,
            c.suma_cantidad,
            c.suma_total_kg,
            c.observaciones
         FROM controles_salida c
         JOIN tipos_documento_salida td ON td.id = c.tipo_documento_id
         JOIN especies e ON e.id = c.especie_id
         ORDER BY c.fecha DESC, c.id DESC
         LIMIT ?1 OFFSET ?2",
        params,
    ).await.map_err(|e| e.to_string())?;

    let mut salidas = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        salidas.push(ControlSalidaResumen {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            numero_control: row.get(1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            cliente: row.get(3).map_err(|e| e.to_string())?,
            tipo_documento_id: row.get(4).map_err(|e| e.to_string())?,
            tipo_documento_codigo: row.get(5).map_err(|e| e.to_string())?,
            tipo_documento_descripcion: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
            especie_id: row.get(7).map_err(|e| e.to_string())?,
            especie_nombre: row.get(8).map_err(|e| e.to_string())?,
            suma_cantidad: row.get(9).map_err(|e| e.to_string())?,
            suma_total_kg: row.get(10).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 11).map_err(|e| e.to_string())?,
        });
    }
    Ok(salidas)
}

pub async fn contar_salidas(db: &Database) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT COUNT(*) FROM controles_salida", ()).await.map_err(|e| e.to_string())?;
    
    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => row.get(0).map_err(|e| e.to_string()),
        None => Ok(0),
    }
}

