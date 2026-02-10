use libsql::Database;
use crate::db::types::Calibre;
use crate::db::helpers::{option_i64_to_value, get_optional_i64};

pub async fn crear_calibre(db: &Database, calibre: &Calibre) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO calibres (valor_minimo, valor_maximo) VALUES (?1, ?2)",
        [option_i64_to_value(calibre.valor_minimo), option_i64_to_value(calibre.valor_maximo)],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_calibres(db: &Database) -> Result<Vec<Calibre>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, valor_minimo, valor_maximo FROM calibres ORDER BY valor_minimo, valor_maximo",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut calibres = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        calibres.push(Calibre {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            valor_minimo: get_optional_i64(&row, 1).map_err(|e| e.to_string())?,
            valor_maximo: get_optional_i64(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(calibres)
}

pub async fn actualizar_calibre(db: &Database, id: i64, calibre: &Calibre) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE calibres SET valor_minimo = ?1, valor_maximo = ?2 WHERE id = ?3",
        [option_i64_to_value(calibre.valor_minimo), option_i64_to_value(calibre.valor_maximo), id.into()],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_calibre(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM calibres WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
