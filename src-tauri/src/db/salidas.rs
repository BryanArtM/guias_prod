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
    tipo_documento_id: Option<i64>,
    especie_id: Option<i64>,
) -> Result<Vec<ControlSalidaResumen>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    use libsql::Value;

    let mut where_clauses = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if let Some(t) = tipo_documento_id {
        where_clauses.push(format!("c.tipo_documento_id = ?{}", params.len() + 1));
        params.push(Value::from(t));
    }
    if let Some(e) = especie_id {
        where_clauses.push(format!("c.especie_id = ?{}", params.len() + 1));
        params.push(Value::from(e));
    }

    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };

    let limit_idx = params.len() + 1;
    let offset_idx = params.len() + 2;
    params.push(Value::from(limite));
    params.push(Value::from(offset));

    let query = format!(
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
         {}
         ORDER BY c.fecha DESC, c.id DESC
         LIMIT ?{} OFFSET ?{}",
        where_sql, limit_idx, offset_idx
    );

    let mut result = conn.query(query.as_str(), params).await.map_err(|e| e.to_string())?;

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

pub async fn contar_salidas(
    db: &Database,
    tipo_documento_id: Option<i64>,
    especie_id: Option<i64>,
) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    use libsql::Value;

    let mut where_clauses = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if let Some(t) = tipo_documento_id {
        where_clauses.push(format!("tipo_documento_id = ?{}", params.len() + 1));
        params.push(Value::from(t));
    }
    if let Some(e) = especie_id {
        where_clauses.push(format!("especie_id = ?{}", params.len() + 1));
        params.push(Value::from(e));
    }

    let where_sql = if where_clauses.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", where_clauses.join(" AND "))
    };

    let query = format!("SELECT COUNT(*) FROM controles_salida {}", where_sql);
    let mut result = conn.query(query.as_str(), params).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => row.get(0).map_err(|e| e.to_string()),
        None => Ok(0),
    }
}