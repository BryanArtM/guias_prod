use rusqlite::{Connection, Result};
use crate::db::types::{FormaEnvasado, FormaEmpacado};

pub fn crear_forma_envasado(conn: &Connection, forma: &FormaEnvasado) -> Result<i64> {
    conn.execute(
        "INSERT INTO formas_envasado (nombre, descripcion) VALUES (?1, ?2)",
        (&forma.nombre, &forma.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_formas_envasado(conn: &Connection) -> Result<Vec<FormaEnvasado>> {
    let mut stmt =
        conn.prepare("SELECT id, nombre, descripcion FROM formas_envasado ORDER BY nombre")?;
    let formas_iter = stmt.query_map([], |row| {
        Ok(FormaEnvasado {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut formas = Vec::new();
    for forma in formas_iter {
        formas.push(forma?);
    }
    Ok(formas)
}

pub fn actualizar_forma_envasado(conn: &Connection, id: i64, forma: &FormaEnvasado) -> Result<()> {
    conn.execute(
        "UPDATE formas_envasado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&forma.nombre, &forma.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_forma_envasado(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM formas_envasado WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD FORMAS DE EMPACADO ============

pub fn crear_forma_empacado(conn: &Connection, forma: &FormaEmpacado) -> Result<i64> {
    conn.execute(
        "INSERT INTO formas_empacado (nombre, descripcion) VALUES (?1, ?2)",
        (&forma.nombre, &forma.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_formas_empacado(conn: &Connection) -> Result<Vec<FormaEmpacado>> {
    let mut stmt =
        conn.prepare("SELECT id, nombre, descripcion FROM formas_empacado ORDER BY nombre")?;
    let formas_iter = stmt.query_map([], |row| {
        Ok(FormaEmpacado {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut formas = Vec::new();
    for forma in formas_iter {
        formas.push(forma?);
    }
    Ok(formas)
}

pub fn actualizar_forma_empacado(conn: &Connection, id: i64, forma: &FormaEmpacado) -> Result<()> {
    conn.execute(
        "UPDATE formas_empacado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&forma.nombre, &forma.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_forma_empacado(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM formas_empacado WHERE id = ?1", [id])?;
    Ok(())
}
