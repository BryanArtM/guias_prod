use rusqlite::{Connection, Result};
use crate::db::types::Calidad;

pub fn crear_calidad(conn: &Connection, calidad: &Calidad) -> Result<i64> {
    conn.execute(
        "INSERT INTO calidades (nombre, descripcion) VALUES (?1, ?2)",
        (&calidad.nombre, &calidad.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_calidades(conn: &Connection) -> Result<Vec<Calidad>> {
    let mut stmt = conn.prepare("SELECT id, nombre, descripcion FROM calidades ORDER BY nombre")?;
    let calidades_iter = stmt.query_map([], |row| {
        Ok(Calidad {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut calidades = Vec::new();
    for calidad in calidades_iter {
        calidades.push(calidad?);
    }
    Ok(calidades)
}

pub fn actualizar_calidad(conn: &Connection, id: i64, calidad: &Calidad) -> Result<()> {
    conn.execute(
        "UPDATE calidades SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&calidad.nombre, &calidad.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_calidad(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM calidades WHERE id = ?1", [id])?;
    Ok(())
}
