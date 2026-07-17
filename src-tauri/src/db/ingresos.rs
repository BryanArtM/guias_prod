use libsql::{Database, Value};
use crate::db::types::ParteProduccionResumen;
use crate::db::helpers::*;

pub async fn obtener_ingresos(db: &Database) -> Result<Vec<ParteProduccionResumen>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT p.id, p.codigo, p.fecha, p.cliente,
                p.tipo_documento_id, td.codigo,
                p.especie_id, e.nombre
         FROM partes_produccion p
         JOIN tipos_documento_produccion td ON td.id = p.tipo_documento_id
         LEFT JOIN especies e ON e.id = p.especie_id
         ORDER BY p.fecha DESC, p.id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(ParteProduccionResumen {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: get_optional_string(&row, 1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            cliente: get_optional_string(&row, 3).map_err(|e| e.to_string())?,
            tipo_documento_id: row.get(4).map_err(|e| e.to_string())?,
            tipo_documento_codigo: row.get(5).map_err(|e| e.to_string())?,
            especie_id: get_optional_i64(&row, 6).map_err(|e| e.to_string())?,
            especie_nombre: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn obtener_ingresos_paginados(
    db: &Database,
    limite: i64,
    offset: i64,
    tipo_documento_id: Option<i64>,
    especie_id: Option<i64>,
) -> Result<Vec<ParteProduccionResumen>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;

    let mut where_clauses = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if let Some(t) = tipo_documento_id {
        where_clauses.push(format!("p.tipo_documento_id = ?{}", params.len() + 1));
        params.push(Value::from(t));
    }
    if let Some(e) = especie_id {
        where_clauses.push(format!("p.especie_id = ?{}", params.len() + 1));
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
        "SELECT p.id, p.codigo, p.fecha, p.cliente,
                p.tipo_documento_id, td.codigo,
                p.especie_id, e.nombre
         FROM partes_produccion p
         JOIN tipos_documento_produccion td ON td.id = p.tipo_documento_id
         LEFT JOIN especies e ON e.id = p.especie_id
         {}
         ORDER BY p.fecha DESC, p.id DESC
         LIMIT ?{} OFFSET ?{}",
        where_sql, limit_idx, offset_idx
    );

    let mut result = conn.query(query.as_str(), params).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(ParteProduccionResumen {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: get_optional_string(&row, 1).map_err(|e| e.to_string())?,
            fecha: row.get(2).map_err(|e| e.to_string())?,
            cliente: get_optional_string(&row, 3).map_err(|e| e.to_string())?,
            tipo_documento_id: row.get(4).map_err(|e| e.to_string())?,
            tipo_documento_codigo: row.get(5).map_err(|e| e.to_string())?,
            especie_id: get_optional_i64(&row, 6).map_err(|e| e.to_string())?,
            especie_nombre: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn contar_ingresos(
    db: &Database,
    tipo_documento_id: Option<i64>,
    especie_id: Option<i64>,
) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;

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

    let query = format!("SELECT COUNT(*) FROM partes_produccion {}", where_sql);
    let mut result = conn.query(query.as_str(), params).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => row.get(0).map_err(|e| e.to_string()),
        None => Ok(0),
    }
}