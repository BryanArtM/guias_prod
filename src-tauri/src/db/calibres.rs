use libsql::Database;
use crate::db::types::Calibre;
use crate::db::helpers::{get_optional_string, option_string_to_value};

fn normalizar_extremo(valor: Option<String>) -> Option<String> {
    valor
        .map(|texto| texto.trim().to_string())
        .filter(|texto| !texto.is_empty())
}

pub async fn crear_calibre(db: &Database, calibre: &Calibre) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO calibres (valor_minimo, valor_maximo) VALUES (?1, ?2)",
        [
            option_string_to_value(normalizar_extremo(calibre.valor_minimo.clone())),
            option_string_to_value(normalizar_extremo(calibre.valor_maximo.clone())),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_calibres(db: &Database) -> Result<Vec<Calibre>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    // Los calibres numericos se ordenan por su valor y los de texto quedan
    // despues, agrupados alfabeticamente.
    let mut result = conn.query(
        "SELECT id, valor_minimo, valor_maximo FROM calibres
         ORDER BY CAST(valor_minimo AS INTEGER), valor_minimo, valor_maximo",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut calibres = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        calibres.push(Calibre {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            valor_minimo: get_optional_string(&row, 1).map_err(|e| e.to_string())?,
            valor_maximo: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        });
    }
    Ok(calibres)
}

pub async fn actualizar_calibre(db: &Database, id: i64, calibre: &Calibre) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE calibres SET valor_minimo = ?1, valor_maximo = ?2 WHERE id = ?3",
        [
            option_string_to_value(normalizar_extremo(calibre.valor_minimo.clone())),
            option_string_to_value(normalizar_extremo(calibre.valor_maximo.clone())),
            id.into(),
        ],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_calibre(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM calibres WHERE id = ?1", [libsql::Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
