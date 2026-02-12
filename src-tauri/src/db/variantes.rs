use libsql::Database;
use crate::db::types::{VariantePresentacion, VarianteCompleta};
use crate::db::helpers::*;

pub async fn crear_variante_presentacion(
    db: &Database,
    variante: &VariantePresentacion,
) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO variantes_presentaciones 
         (presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [
            variante.presentacion_id.into(),
            option_i64_to_value(variante.forma_envasado_id),
            option_i64_to_value(variante.forma_empacado_id),
            if variante.ensunchado { 1 } else { 0 }.into(),
            option_i64_to_value(variante.calidad_id),
            option_i64_to_value(variante.calibre_id),
            option_string_to_value(variante.observaciones.clone()),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_variantes_presentaciones(db: &Database) -> Result<Vec<VariantePresentacion>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones 
         FROM variantes_presentaciones ORDER BY id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut variantes = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        let ensunchado = get_bool_from_int(&row, 4).map_err(|e| e.to_string())?;
        variantes.push(VariantePresentacion {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            presentacion_id: row.get(1).map_err(|e| e.to_string())?,
            forma_envasado_id: get_optional_i64(&row, 2).map_err(|e| e.to_string())?,
            forma_empacado_id: get_optional_i64(&row, 3).map_err(|e| e.to_string())?,
            ensunchado,
            calidad_id: get_optional_i64(&row, 5).map_err(|e| e.to_string())?,
            calibre_id: get_optional_i64(&row, 6).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        });
    }
    Ok(variantes)
}

pub async fn obtener_variantes_completas(db: &Database) -> Result<Vec<VarianteCompleta>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
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
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut variantes = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        variantes.push(VarianteCompleta {
            variante_id: row.get(0).map_err(|e| e.to_string())?,
            especie_id: row.get(1).map_err(|e| e.to_string())?,
            especie_nombre: row.get(2).map_err(|e| e.to_string())?,
            presentacion_id: row.get(3).map_err(|e| e.to_string())?,
            presentacion_nombre: row.get(4).map_err(|e| e.to_string())?,
            forma_envasado: get_optional_string(&row, 5).map_err(|e| e.to_string())?,
            forma_empacado: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
            tipo_ensunchado: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
            calidad: get_optional_string(&row, 8).map_err(|e| e.to_string())?,
            calibre: get_optional_string(&row, 9).map_err(|e| e.to_string())?,
            codigo_completo: row.get(10).map_err(|e| e.to_string())?,
        });
    }
    Ok(variantes)
}

pub async fn actualizar_variante_presentacion(
    db: &Database,
    id: i64,
    variante: &VariantePresentacion,
) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE variantes_presentaciones 
         SET presentacion_id = ?1, forma_envasado_id = ?2, forma_empacado_id = ?3, 
             ensunchado = ?4, calidad_id = ?5, calibre_id = ?6, observaciones = ?7
         WHERE id = ?8",
        [
            variante.presentacion_id.into(),
            option_i64_to_value(variante.forma_envasado_id),
            option_i64_to_value(variante.forma_empacado_id),
            if variante.ensunchado { 1 } else { 0 }.into(),
            option_i64_to_value(variante.calidad_id),
            option_i64_to_value(variante.calibre_id),
            option_string_to_value(variante.observaciones.clone()),
            id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_variante_presentacion(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM variantes_presentaciones WHERE id = ?1", [id])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
