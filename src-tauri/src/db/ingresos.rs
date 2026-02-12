use libsql::Database;
use crate::db::types::{Ingreso, TipoIngreso};
use crate::db::helpers::*;

pub async fn obtener_tipos_ingreso(db: &Database) -> Result<Vec<TipoIngreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT id, codigo, descripcion FROM tipos_ingreso ORDER BY codigo", ())
        .await.map_err(|e| e.to_string())?;

    let mut tipos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        tipos.push(TipoIngreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: row.get(1).map_err(|e| e.to_string())?,
            descripcion: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(tipos)
}

pub async fn crear_ingreso(db: &Database, ingreso: &Ingreso) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO ingresos 
         (variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [
            ingreso.variante_id.into(),
            ingreso.tipo_ingreso_id.into(),
            ingreso.fecha.clone().into(),
            option_f64_to_value(ingreso.peso_total_lote),
            ingreso.kg.into(),
            ingreso.cajas.into(),
            option_string_to_value(ingreso.observaciones.clone()),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_ingresos(db: &Database) -> Result<Vec<Ingreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, 
                observaciones
         FROM ingresos 
         ORDER BY fecha DESC, id DESC",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(Ingreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            variante_id: row.get(1).map_err(|e| e.to_string())?,
            tipo_ingreso_id: row.get(2).map_err(|e| e.to_string())?,
            fecha: row.get(3).map_err(|e| e.to_string())?,
            peso_total_lote: get_optional_f64(&row, 4).map_err(|e| e.to_string())?,
            kg: row.get(5).map_err(|e| e.to_string())?,
            cajas: row.get(6).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn obtener_ingresos_paginados(
    db: &Database, 
    limite: i64, 
    offset: i64
) -> Result<Vec<Ingreso>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    use libsql::Value;
    let params: Vec<Value> = vec![limite.into(), offset.into()];
    
    let mut result = conn.query(
        "SELECT id, variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, 
                observaciones
         FROM ingresos 
         ORDER BY fecha DESC, id DESC
         LIMIT ?1 OFFSET ?2",
        params,
    ).await.map_err(|e| e.to_string())?;

    let mut ingresos = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        ingresos.push(Ingreso {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            variante_id: row.get(1).map_err(|e| e.to_string())?,
            tipo_ingreso_id: row.get(2).map_err(|e| e.to_string())?,
            fecha: row.get(3).map_err(|e| e.to_string())?,
            peso_total_lote: get_optional_f64(&row, 4).map_err(|e| e.to_string())?,
            kg: row.get(5).map_err(|e| e.to_string())?,
            cajas: row.get(6).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        });
    }
    Ok(ingresos)
}

pub async fn contar_ingresos(db: &Database) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query("SELECT COUNT(*) FROM ingresos", ()).await.map_err(|e| e.to_string())?;
    
    match result.next().await.map_err(|e| e.to_string())? {
        Some(row) => row.get(0).map_err(|e| e.to_string()),
        None => Ok(0),
    }
}

pub async fn actualizar_ingreso(db: &Database, id: i64, ingreso: &Ingreso) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE ingresos 
         SET variante_id = ?1, tipo_ingreso_id = ?2, fecha = ?3, peso_total_lote = ?4, 
             kg = ?5, cajas = ?6, observaciones = ?7
         WHERE id = ?8",
        [
            ingreso.variante_id.into(),
            ingreso.tipo_ingreso_id.into(),
            ingreso.fecha.clone().into(),
            option_f64_to_value(ingreso.peso_total_lote),
            ingreso.kg.into(),
            ingreso.cajas.into(),
            option_string_to_value(ingreso.observaciones.clone()),
            id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_ingreso(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM ingresos WHERE id = ?1", [id])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn crear_ingresos_batch(db: &Database, ingresos: &[Ingreso]) -> Result<Vec<i64>, String> {
    if ingresos.is_empty() {
        return Ok(Vec::new());
    }

    let conn = db.connect().map_err(|e| e.to_string())?;
    
    conn.execute("BEGIN TRANSACTION", ()).await.map_err(|e| e.to_string())?;
    
    let mut ids = Vec::with_capacity(ingresos.len());
    
    for ingreso in ingresos {
        match conn.execute(
            "INSERT INTO ingresos 
             (variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, observaciones)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            [
                ingreso.variante_id.into(),
                ingreso.tipo_ingreso_id.into(),
                ingreso.fecha.clone().into(),
                option_f64_to_value(ingreso.peso_total_lote),
                ingreso.kg.into(),
                ingreso.cajas.into(),
                option_string_to_value(ingreso.observaciones.clone()),
            ],
        ).await {
            Ok(_) => ids.push(conn.last_insert_rowid()),
            Err(e) => {
                conn.execute("ROLLBACK", ()).await.map_err(|e| e.to_string())?;
                return Err(e.to_string());
            }
        }
    }
    
    conn.execute("COMMIT", ()).await.map_err(|e| e.to_string())?;
    Ok(ids)
}
