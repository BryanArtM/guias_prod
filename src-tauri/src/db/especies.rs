use rusqlite::{Connection, Result};
use crate::db::types::Especie;

pub fn crear_especie(conn: &Connection, especie: &Especie) -> Result<i64> {
    conn.execute(
        "INSERT INTO especies (nombre, descripcion) VALUES (?1, ?2)",
        (&especie.nombre, &especie.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_especies(conn: &Connection) -> Result<Vec<Especie>> {
    let mut stmt = conn.prepare("SELECT id, nombre, descripcion FROM especies ORDER BY nombre")?;
    let especies_iter = stmt.query_map([], |row| {
        Ok(Especie {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut especies = Vec::new();
    for especie in especies_iter {
        especies.push(especie?);
    }
    Ok(especies)
}

pub fn obtener_especie(conn: &Connection, id: i64) -> Result<Especie> {
    conn.query_row(
        "SELECT id, nombre, descripcion FROM especies WHERE id = ?1",
        [id],
        |row| {
            Ok(Especie {
                id: Some(row.get(0)?),
                nombre: row.get(1)?,
                descripcion: row.get(2)?,
            })
        },
    )
}

pub fn actualizar_especie(conn: &Connection, id: i64, especie: &Especie) -> Result<()> {
    conn.execute(
        "UPDATE especies SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&especie.nombre, &especie.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_especie(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM especies WHERE id = ?1", [id])?;
    Ok(())
}
