use libsql::Database;
use crate::db::types::Presentacion;
use crate::db::helpers::option_string_to_value;

pub async fn crear_presentacion(db: &Database, presentacion: &Presentacion) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO presentaciones (especie_id, nombre, descripcion) VALUES (?1, ?2, ?3)",
        [presentacion.especie_id.into(), presentacion.nombre.clone().into(), option_string_to_value(presentacion.descripcion.clone())],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_presentaciones(db: &Database) -> Result<Vec<Presentacion>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones ORDER BY nombre",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut presentaciones = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        presentaciones.push(Presentacion {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            especie_id: row.get(1).map_err(|e| e.to_string())?,
            nombre: row.get(2).map_err(|e| e.to_string())?,
            descripcion: row.get(3).map_err(|e| e.to_string())?,
        });
    }
    Ok(presentaciones)
}

pub async fn obtener_presentaciones_por_especie(
    db: &Database,
    especie_id: i64,
) -> Result<Vec<Presentacion>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones WHERE especie_id = ?1 ORDER BY nombre",
        [libsql::Value::from(especie_id)],
    ).await.map_err(|e| e.to_string())?;

    let mut presentaciones = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        presentaciones.push(Presentacion {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            especie_id: row.get(1).map_err(|e| e.to_string())?,
            nombre: row.get(2).map_err(|e| e.to_string())?,
            descripcion: row.get(3).map_err(|e| e.to_string())?,
        });
    }
    Ok(presentaciones)
}

pub async fn actualizar_presentacion(
    db: &Database,
    id: i64,
    presentacion: &Presentacion,
) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE presentaciones SET especie_id = ?1, nombre = ?2, descripcion = ?3 WHERE id = ?4",
        [presentacion.especie_id.into(), presentacion.nombre.clone().into(), option_string_to_value(presentacion.descripcion.clone()), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_presentacion(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM presentaciones WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
