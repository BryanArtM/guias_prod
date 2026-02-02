use rusqlite::{Connection, Result};
use crate::db::types::{Ingreso, TipoIngreso};

pub fn obtener_tipos_ingreso(conn: &Connection) -> Result<Vec<TipoIngreso>> {
    let mut stmt =
        conn.prepare("SELECT id, codigo, descripcion FROM tipos_ingreso ORDER BY codigo")?;
    let tipos_iter = stmt.query_map([], |row| {
        Ok(TipoIngreso {
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

pub fn crear_ingreso(conn: &Connection, ingreso: &Ingreso) -> Result<i64> {
    conn.execute(
        "INSERT INTO ingresos 
         (variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &ingreso.variante_id,
            &ingreso.tipo_ingreso_id,
            &ingreso.fecha,
            &ingreso.peso_total_lote,
            &ingreso.kg,
            &ingreso.cajas,
            &ingreso.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_ingresos(conn: &Connection) -> Result<Vec<Ingreso>> {
    let mut stmt = conn.prepare(
        "SELECT id, variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, 
                observaciones
         FROM ingresos 
         ORDER BY fecha DESC, id DESC",
    )?;
    let ingresos_iter = stmt.query_map([], |row| {
        Ok(Ingreso {
            id: Some(row.get(0)?),
            variante_id: row.get(1)?,
            tipo_ingreso_id: row.get(2)?,
            fecha: row.get(3)?,
            peso_total_lote: row.get(4)?,
            kg: row.get(5)?,
            cajas: row.get(6)?,
            observaciones: row.get(7)?,
        })
    })?;

    let mut ingresos = Vec::new();
    for ingreso in ingresos_iter {
        ingresos.push(ingreso?);
    }
    Ok(ingresos)
}

pub fn actualizar_ingreso(conn: &Connection, id: i64, ingreso: &Ingreso) -> Result<()> {
    conn.execute(
        "UPDATE ingresos 
         SET variante_id = ?1, tipo_ingreso_id = ?2, fecha = ?3, peso_total_lote = ?4, 
             kg = ?5, cajas = ?6, observaciones = ?7
         WHERE id = ?8",
        (
            &ingreso.variante_id,
            &ingreso.tipo_ingreso_id,
            &ingreso.fecha,
            &ingreso.peso_total_lote,
            &ingreso.kg,
            &ingreso.cajas,
            &ingreso.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_ingreso(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM ingresos WHERE id = ?1", [id])?;
    Ok(())
}
