use libsql::Database;
use crate::db::types::Calidad;
use crate::db::helpers::option_string_to_value;

pub async fn crear_calidad(db: &Database, calidad: &Calidad) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO calidades (nombre, descripcion) VALUES (?1, ?2)",
        [calidad.nombre.clone().into(), option_string_to_value(calidad.descripcion.clone())],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_calidades(db: &Database) -> Result<Vec<Calidad>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, nombre, descripcion FROM calidades ORDER BY nombre", ())
        .await.map_err(|e| e.to_string())?;

    let mut calidades = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        calidades.push(Calidad {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
        });
    }
    Ok(calidades)
}

pub async fn actualizar_calidad(db: &Database, id: i64, calidad: &Calidad) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE calidades SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        [calidad.nombre.clone().into(), option_string_to_value(calidad.descripcion.clone()), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_calidad(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM calidades WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
