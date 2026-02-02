use rusqlite::{Connection, Result};
use crate::db::types::{Salida, TipoSalida};


pub fn obtener_tipos_salida(conn: &Connection) -> Result<Vec<TipoSalida>> {
    let mut stmt =
        conn.prepare("SELECT id, codigo, descripcion FROM tipos_salida ORDER BY codigo")?;
    let tipos_iter = stmt.query_map([], |row| {
        Ok(TipoSalida {
            id: Some(row.get(0)?),
            codigo: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut tipos = Vec::new();
    for tipo in tipos_iter {
        tipos.push(tipo?);
    }
    Ok(tipos)
}

pub fn crear_salida(conn: &Connection, salida: &Salida) -> Result<i64> {
    conn.execute(
        "INSERT INTO salidas 
         (variante_id, tipo_salida_id, fecha, kg, cajas, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        (
            &salida.variante_id,
            &salida.tipo_salida_id,
            &salida.fecha,
            &salida.kg,
            &salida.cajas,
            &salida.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_salidas(conn: &Connection) -> Result<Vec<Salida>> {
    let mut stmt = conn.prepare(
        "SELECT id, variante_id, tipo_salida_id, fecha, kg, cajas, observaciones
         FROM salidas 
         ORDER BY fecha DESC, id DESC",
    )?;
    let salidas_iter = stmt.query_map([], |row| {
        Ok(Salida {
            id: Some(row.get(0)?),
            variante_id: row.get(1)?,
            tipo_salida_id: row.get(2)?,
            fecha: row.get(3)?,
            kg: row.get(4)?,
            cajas: row.get(5)?,
            observaciones: row.get(6)?,
        })
    })?;

    let mut salidas = Vec::new();
    for salida in salidas_iter {
        salidas.push(salida?);
    }
    Ok(salidas)
}

pub fn actualizar_salida(conn: &Connection, id: i64, salida: &Salida) -> Result<()> {
    conn.execute(
        "UPDATE salidas 
         SET variante_id = ?1, tipo_salida_id = ?2, fecha = ?3, kg = ?4, cajas = ?5, 
             observaciones = ?6
         WHERE id = ?7",
        (
            &salida.variante_id,
            &salida.tipo_salida_id,
            &salida.fecha,
            &salida.kg,
            &salida.cajas,
            &salida.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_salida(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM salidas WHERE id = ?1", [id])?;
    Ok(())
}
