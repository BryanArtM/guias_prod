use libsql::Database;
use crate::db::types::{StockActual, StockVariante};

// CONSULTAS DE STOCK 

pub async fn obtener_stock_por_variante(db: &Database) -> Result<Vec<StockVariante>, String> {
    let actual = obtener_stock_actual(db).await?;
    let mut stocks = Vec::with_capacity(actual.len());

    for item in actual {
        stocks.push(StockVariante {
            variante_id: item.variante_id,
            codigo_completo: item.codigo_completo,
            especie_nombre: String::new(),
            presentacion_nombre: String::new(),
            kg_ingresados: item.stock_kg,
            kg_salidos: 0.0,
            kg_stock: item.stock_kg,
            cajas_ingresadas: item.stock_cajas as i32,
            cajas_salidas: 0,
            cajas_stock: item.stock_cajas as i32,
        });
    }

    Ok(stocks)
}

pub async fn obtener_stock_actual(db: &Database) -> Result<Vec<StockActual>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT variante_id, codigo_completo, stock_kg, stock_cajas FROM stock_actual_view ORDER BY codigo_completo",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut stocks = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        stocks.push(StockActual {
            variante_id: row.get(0).map_err(|e| e.to_string())?,
            codigo_completo: row.get(1).map_err(|e| e.to_string())?,
            stock_kg: row.get(2).map_err(|e| e.to_string())?,
            stock_cajas: row.get(3).map_err(|e| e.to_string())?,
        });
    }
    Ok(stocks)
}
