use libsql::Database;
use crate::db::types::ControlSalidaResumen;
use crate::db::helpers::*;



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
            c.especie_id,
            e.nombre
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
            especie_id: row.get(6).map_err(|e| e.to_string())?,
            especie_nombre: row.get(7).map_err(|e| e.to_string())?,
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
            c.especie_id,
            e.nombre
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
            especie_id: row.get(6).map_err(|e| e.to_string())?,
            especie_nombre: row.get(7).map_err(|e| e.to_string())?,
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

