use rusqlite::{Connection, Result};
use crate::db::types::{VariantePresentacion, VarianteCompleta};

pub fn crear_variante_presentacion(
    conn: &Connection,
    variante: &VariantePresentacion,
) -> Result<i64> {
    conn.execute(
        "INSERT INTO variantes_presentaciones 
         (presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &variante.presentacion_id,
            &variante.forma_envasado_id,
            &variante.forma_empacado_id,
            if variante.ensunchado { 1 } else { 0 },
            &variante.calidad_id,
            &variante.calibre_id,
            &variante.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_variantes_presentaciones(conn: &Connection) -> Result<Vec<VariantePresentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones 
         FROM variantes_presentaciones ORDER BY id DESC",
    )?;
    let variantes_iter = stmt.query_map([], |row| {
        let ensunchado_int: i64 = row.get(4)?;
        Ok(VariantePresentacion {
            id: Some(row.get(0)?),
            presentacion_id: row.get(1)?,
            forma_envasado_id: row.get(2)?,
            forma_empacado_id: row.get(3)?,
            ensunchado: ensunchado_int != 0,
            calidad_id: row.get(5)?,
            calibre_id: row.get(6)?,
            observaciones: row.get(7)?,
        })
    })?;

    let mut variantes = Vec::new();
    for variante in variantes_iter {
        variantes.push(variante?);
    }
    Ok(variantes)
}

pub fn obtener_variantes_completas(conn: &Connection) -> Result<Vec<VarianteCompleta>> {
    // La vista centraliza toda la lógica de JOINs y concatenación
    let mut stmt = conn.prepare(
        "SELECT 
            variante_id,
            especie_id,
            especie_nombre,
            presentacion_id,
            presentacion_nombre,
            forma_envasado,
            forma_empacado,
            tipo_ensunchado,
            calidad,
            calibre,
            codigo_completo
         FROM variantes_completas_view
         ORDER BY especie_nombre, presentacion_nombre",
    )?;
    
    let variantes_iter = stmt.query_map([], |row| {
        Ok(VarianteCompleta {
            variante_id: row.get(0)?,
            especie_id: row.get(1)?,
            especie_nombre: row.get(2)?,
            presentacion_id: row.get(3)?,
            presentacion_nombre: row.get(4)?,
            forma_envasado: row.get(5)?,
            forma_empacado: row.get(6)?,
            tipo_ensunchado: row.get(7)?,
            calidad: row.get(8)?,
            calibre: row.get(9)?,
            codigo_completo: row.get(10)?,
        })
    })?;

    let mut variantes = Vec::new();
    for variante in variantes_iter {
        variantes.push(variante?);
    }
    Ok(variantes)
}

pub fn actualizar_variante_presentacion(
    conn: &Connection,
    id: i64,
    variante: &VariantePresentacion,
) -> Result<()> {
    conn.execute(
        "UPDATE variantes_presentaciones 
         SET presentacion_id = ?1, forma_envasado_id = ?2, forma_empacado_id = ?3, 
             ensunchado = ?4, calidad_id = ?5, calibre_id = ?6, observaciones = ?7
         WHERE id = ?8",
        (
            &variante.presentacion_id,
            &variante.forma_envasado_id,
            &variante.forma_empacado_id,
            if variante.ensunchado { 1 } else { 0 },
            &variante.calidad_id,
            &variante.calibre_id,
            &variante.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_variante_presentacion(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM variantes_presentaciones WHERE id = ?1", [id])?;
    Ok(())
}
