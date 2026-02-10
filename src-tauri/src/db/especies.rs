use libsql::Database;
use crate::db::types::Especie;
use crate::db::helpers::option_string_to_value;

pub async fn crear_especie(db: &Database, especie: &Especie) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO especies (nombre, descripcion) VALUES (?1, ?2)",
        [especie.nombre.clone().into(), option_string_to_value(especie.descripcion.clone())],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_especies(db: &Database) -> Result<Vec<Especie>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, nombre, descripcion FROM especies ORDER BY nombre", ())
        .await.map_err(|e| e.to_string())?;

    let mut especies = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        especies.push(Especie {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
        });
    }
    Ok(especies)
}

pub async fn obtener_especie(db: &Database, id: i64) -> Result<Especie, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, nombre, descripcion FROM especies WHERE id = ?1",
        [libsql::Value::from(id)],
    ).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => Ok(Especie {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
        }),
        None => Err("Especie no encontrada".to_string()),
    }
}

pub async fn actualizar_especie(db: &Database, id: i64, especie: &Especie) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE especies SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        [especie.nombre.clone().into(), option_string_to_value(especie.descripcion.clone()), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_especie(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM especies WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
