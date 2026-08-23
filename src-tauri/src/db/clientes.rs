use libsql::{Database, Value};
use crate::db::types::Cliente;

fn validar(cliente: &Cliente) -> Result<(String, String), String> {
    let codigo = cliente.codigo.trim().to_uppercase();
    let razon_social = cliente.razon_social.trim().to_string();

    if codigo.is_empty() {
        return Err("El codigo del cliente es requerido".to_string());
    }
    if razon_social.is_empty() {
        return Err("La razon social es requerida".to_string());
    }

    Ok((codigo, razon_social))
}

pub async fn crear_cliente(db: &Database, cliente: &Cliente) -> Result<i64, String> {
    let (codigo, razon_social) = validar(cliente)?;
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO clientes (codigo, razon_social) VALUES (?1, ?2)",
        [Value::from(codigo), Value::from(razon_social)],
    ).await.map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

pub async fn obtener_clientes(db: &Database) -> Result<Vec<Cliente>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT id, codigo, razon_social FROM clientes ORDER BY razon_social",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut clientes = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        clientes.push(Cliente {
            id: Some(row.get(0).map_err(|e| e.to_string())?),
            codigo: row.get(1).map_err(|e| e.to_string())?,
            razon_social: row.get(2).map_err(|e| e.to_string())?,
        });
    }
    Ok(clientes)
}

pub async fn actualizar_cliente(db: &Database, id: i64, cliente: &Cliente) -> Result<(), String> {
    let (codigo, razon_social) = validar(cliente)?;
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE clientes SET codigo = ?1, razon_social = ?2 WHERE id = ?3",
        [Value::from(codigo), Value::from(razon_social), Value::from(id)],
    ).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_cliente(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM clientes WHERE id = ?1", [Value::from(id)])
        .await.map_err(|e| e.to_string())?;
    Ok(())
}
