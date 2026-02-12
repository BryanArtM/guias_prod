use libsql::Database;
use crate::db::types::{FormaEnvasado, FormaEmpacado};
use crate::db::helpers::option_string_to_value;

pub async fn crear_forma_envasado(db: &Database, forma: &FormaEnvasado) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO formas_envasado (nombre, descripcion) VALUES (?1, ?2)",
        [forma.nombre.clone().into(), option_string_to_value(forma.descripcion.clone())],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_formas_envasado(db: &Database) -> Result<Vec<FormaEnvasado>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, nombre, descripcion FROM formas_envasado ORDER BY nombre", ())
        .await.map_err(|e| e.to_string())?;

    let mut formas = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        formas.push(FormaEnvasado {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
        });
    }
    Ok(formas)
}

pub async fn actualizar_forma_envasado(db: &Database, id: i64, forma: &FormaEnvasado) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE formas_envasado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        [forma.nombre.clone().into(), option_string_to_value(forma.descripcion.clone()), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_forma_envasado(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM formas_envasado WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}

// ============ CRUD FORMAS DE EMPACADO ============

pub async fn crear_forma_empacado(db: &Database, forma: &FormaEmpacado) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO formas_empacado (nombre, descripcion) VALUES (?1, ?2)",
        [forma.nombre.clone().into(), option_string_to_value(forma.descripcion.clone())],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_formas_empacado(db: &Database) -> Result<Vec<FormaEmpacado>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, nombre, descripcion FROM formas_empacado ORDER BY nombre", ())
        .await.map_err(|e| e.to_string())?;

    let mut formas = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        formas.push(FormaEmpacado {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
        });
    }
    Ok(formas)
}

pub async fn actualizar_forma_empacado(db: &Database, id: i64, forma: &FormaEmpacado) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE formas_empacado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        [forma.nombre.clone().into(), option_string_to_value(forma.descripcion.clone()), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_forma_empacado(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM formas_empacado WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
