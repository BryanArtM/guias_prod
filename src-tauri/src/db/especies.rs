use libsql::Database;
use crate::db::types::Especie;
use crate::db::helpers::{get_optional_f64, option_f64_to_value, option_string_to_value};

/// La abreviatura se coloca en el codigo de trazabilidad, asi que se guarda
/// normalizada: dos letras en mayusculas, o nada si no se informo.
fn normalizar_abreviatura(abreviatura: Option<String>) -> Result<Option<String>, String> {
    let valor = match abreviatura {
        Some(texto) => texto.trim().to_uppercase(),
        None => return Ok(None),
    };

    if valor.is_empty() {
        return Ok(None);
    }

    if valor.chars().count() != 2 || !valor.chars().all(|c| c.is_alphabetic()) {
        return Err("La abreviatura de trazabilidad debe tener exactamente 2 letras".to_string());
    }

    Ok(Some(valor))
}

pub async fn crear_especie(db: &Database, especie: &Especie) -> Result<i64, String> {
    let abreviatura = normalizar_abreviatura(especie.abreviatura_trazabilidad.clone())?;
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO especies (nombre, descripcion, peso_unidad_defecto, abreviatura_trazabilidad)
         VALUES (?1, ?2, ?3, ?4)",
        [
            especie.nombre.clone().into(),
            option_string_to_value(especie.descripcion.clone()),
            option_f64_to_value(especie.peso_unidad_defecto),
            option_string_to_value(abreviatura),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_especies(db: &Database) -> Result<Vec<Especie>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, nombre, descripcion, peso_unidad_defecto, abreviatura_trazabilidad
         FROM especies ORDER BY nombre",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut especies = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        especies.push(Especie {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
            peso_unidad_defecto: get_optional_f64(&row, 3).map_err(|e| e.to_string())?,
            abreviatura_trazabilidad: row.get(4).map_err(|e| e.to_string())?,
        });
    }
    Ok(especies)
}

pub async fn obtener_especie(db: &Database, id: i64) -> Result<Especie, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, nombre, descripcion, peso_unidad_defecto, abreviatura_trazabilidad
         FROM especies WHERE id = ?1",
        [libsql::Value::from(id)],
    ).await.map_err(|e| e.to_string())?;

    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => Ok(Especie {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            nombre: row.get(1).map_err(|e| e.to_string())?,
            descripcion: row.get(2).map_err(|e| e.to_string())?,
            peso_unidad_defecto: get_optional_f64(&row, 3).map_err(|e| e.to_string())?,
            abreviatura_trazabilidad: row.get(4).map_err(|e| e.to_string())?,
        }),
        None => Err("Especie no encontrada".to_string()),
    }
}

pub async fn actualizar_especie(db: &Database, id: i64, especie: &Especie) -> Result<(), String> {
    let abreviatura = normalizar_abreviatura(especie.abreviatura_trazabilidad.clone())?;
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE especies SET nombre = ?1, descripcion = ?2, peso_unidad_defecto = ?3,
                abreviatura_trazabilidad = ?4
         WHERE id = ?5",
        [
            especie.nombre.clone().into(),
            option_string_to_value(especie.descripcion.clone()),
            option_f64_to_value(especie.peso_unidad_defecto),
            option_string_to_value(abreviatura),
            id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_especie(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM especies WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
