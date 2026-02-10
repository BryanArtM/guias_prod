use libsql::Database;
use crate::db::types::{Salida, TipoSalida};
use crate::db::helpers::*;

pub async fn obtener_tipos_salida(db: &Database) -> Result<Vec<TipoSalida>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, codigo, descripcion FROM tipos_salida ORDER BY codigo", ())
        .await.map_err(|e| e.to_string())?;

    let mut tipos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        tipos.push(TipoSalida {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: row.get(1).map_err(|e| e.to_string())?,
            descripcion: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(tipos)
}

pub async fn crear_salida(db: &Database, salida: &Salida) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO salidas 
         (variante_id, tipo_salida_id, fecha, kg, cajas, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        [
            salida.variante_id.into(),
            salida.tipo_salida_id.into(),
            salida.fecha.clone().into(),
            salida.kg.into(),
            salida.cajas.into(),
            option_string_to_value(salida.observaciones.clone()),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_salidas(db: &Database) -> Result<Vec<Salida>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, variante_id, tipo_salida_id, fecha, kg, cajas, observaciones
         FROM salidas 
         ORDER BY fecha DESC, id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut salidas = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        salidas.push(Salida {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            variante_id: row.get(1).map_err(|e| e.to_string())?,
            tipo_salida_id: row.get(2).map_err(|e| e.to_string())?,
            fecha: row.get(3).map_err(|e| e.to_string())?,
            kg: row.get(4).map_err(|e| e.to_string())?,
            cajas: row.get(5).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
        });
    }
    Ok(salidas)
}

pub async fn actualizar_salida(db: &Database, id: i64, salida: &Salida) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE salidas 
         SET variante_id = ?1, tipo_salida_id = ?2, fecha = ?3, kg = ?4, cajas = ?5, 
             observaciones = ?6
         WHERE id = ?7",
        [
            salida.variante_id.into(),
            salida.tipo_salida_id.into(),
            salida.fecha.clone().into(),
            salida.kg.into(),
            salida.cajas.into(),
            option_string_to_value(salida.observaciones.clone()),
            id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_salida(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM salidas WHERE id = ?1", [id])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
