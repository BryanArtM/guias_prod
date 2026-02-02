use rusqlite::{Connection, Result};
use crate::db::types::Presentacion;

pub fn crear_presentacion(conn: &Connection, presentacion: &Presentacion) -> Result<i64> {
    conn.execute(
        "INSERT INTO presentaciones (especie_id, nombre, descripcion) VALUES (?1, ?2, ?3)",
        (
            &presentacion.especie_id,
            &presentacion.nombre,
            &presentacion.descripcion,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_presentaciones(conn: &Connection) -> Result<Vec<Presentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones ORDER BY nombre",
    )?;
    let presentaciones_iter = stmt.query_map([], |row| {
        Ok(Presentacion {
            id: Some(row.get(0)?),
            especie_id: row.get(1)?,
            nombre: row.get(2)?,
            descripcion: row.get(3)?,
        })
    })?;

    let mut presentaciones = Vec::new();
    for presentacion in presentaciones_iter {
        presentaciones.push(presentacion?);
    }
    Ok(presentaciones)
}

pub fn obtener_presentaciones_por_especie(
    conn: &Connection,
    especie_id: i64,
) -> Result<Vec<Presentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones WHERE especie_id = ?1 ORDER BY nombre",
    )?;
    let presentaciones_iter = stmt.query_map([especie_id], |row| {
        Ok(Presentacion {
            id: Some(row.get(0)?),
            especie_id: row.get(1)?,
            nombre: row.get(2)?,
            descripcion: row.get(3)?,
        })
    })?;

    let mut presentaciones = Vec::new();
    for presentacion in presentaciones_iter {
        presentaciones.push(presentacion?);
    }
    Ok(presentaciones)
}

pub fn actualizar_presentacion(
    conn: &Connection,
    id: i64,
    presentacion: &Presentacion,
) -> Result<()> {
    conn.execute(
        "UPDATE presentaciones SET especie_id = ?1, nombre = ?2, descripcion = ?3 WHERE id = ?4",
        (
            &presentacion.especie_id,
            &presentacion.nombre,
            &presentacion.descripcion,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_presentacion(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM presentaciones WHERE id = ?1", [id])?;
    Ok(())
}
