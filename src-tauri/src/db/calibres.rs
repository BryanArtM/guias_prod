use rusqlite::{Connection, Result};
use crate::db::types::Calibre;

pub fn crear_calibre(conn: &Connection, calibre: &Calibre) -> Result<i64> {
    conn.execute(
        "INSERT INTO calibres (valor_minimo, valor_maximo) VALUES (?1, ?2)",
        (&calibre.valor_minimo, &calibre.valor_maximo),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_calibres(conn: &Connection) -> Result<Vec<Calibre>> {
    let mut stmt = conn.prepare(
        "SELECT id, valor_minimo, valor_maximo FROM calibres ORDER BY valor_minimo, valor_maximo",
    )?;
    let calibres_iter = stmt.query_map([], |row| {
        Ok(Calibre {
            id: Some(row.get(0)?),
            valor_minimo: row.get(1)?,
            valor_maximo: row.get(2)?,
        })
    })?;

    let mut calibres = Vec::new();
    for calibre in calibres_iter {
        calibres.push(calibre?);
    }
    Ok(calibres)
}

pub fn actualizar_calibre(conn: &Connection, id: i64, calibre: &Calibre) -> Result<()> {
    conn.execute(
        "UPDATE calibres SET valor_minimo = ?1, valor_maximo = ?2 WHERE id = ?3",
        (
            &calibre.valor_minimo,
            &calibre.valor_maximo,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_calibre(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM calibres WHERE id = ?1", [id])?;
    Ok(())
}
