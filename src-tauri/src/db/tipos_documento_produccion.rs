use libsql::Database;
use crate::db::types::TipoIngreso;

pub async fn obtener_tipos_documento_produccion(db: &Database) -> Result<Vec<TipoIngreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut rows = conn
        .query("SELECT id, codigo, descripcion FROM tipos_documento_produccion ORDER BY id", ())

        .await
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
        let id: i64 = row.get(0).map_err(|e| e.to_string())?;
        let codigo: String = row.get(1).map_err(|e| e.to_string())?;
        let descripcion: Option<String> = match row.get::<String>(2) {
            Ok(v) => Some(v),
            Err(_) => None,
        };
        result.push(TipoIngreso {
            id: Some(id),
            codigo,
            descripcion,
        });
    }
    Ok(result)
}

