use libsql::Database;
use crate::db::helpers::{get_f64, get_i64};
use crate::db::types::{StockActual, StockVariante};

// CONSULTAS DE STOCK

pub async fn obtener_stock_por_variante(db: &Database) -> Result<Vec<StockVariante>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT variante_id, codigo_completo, especie_nombre, presentacion_nombre,
                ingresos_kg, salidas_kg, stock_kg, ingresos_cajas, salidas_cajas, stock_cajas
         FROM stock_actual_view ORDER BY codigo_completo",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut stocks = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        stocks.push(StockVariante {
            variante_id: get_i64(&row, 0).map_err(|e| e.to_string())?,
            codigo_completo: row.get(1).map_err(|e| e.to_string())?,
            especie_nombre: row.get(2).map_err(|e| e.to_string())?,
            presentacion_nombre: row.get(3).map_err(|e| e.to_string())?,
            kg_ingresados: get_f64(&row, 4).map_err(|e| e.to_string())?,
            kg_salidos: get_f64(&row, 5).map_err(|e| e.to_string())?,
            kg_stock: get_f64(&row, 6).map_err(|e| e.to_string())?,
            cajas_ingresadas: get_i64(&row, 7).map_err(|e| e.to_string())? as i32,
            cajas_salidas: get_i64(&row, 8).map_err(|e| e.to_string())? as i32,
            cajas_stock: get_i64(&row, 9).map_err(|e| e.to_string())? as i32,
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
            variante_id: get_i64(&row, 0).map_err(|e| e.to_string())?,
            codigo_completo: row.get(1).map_err(|e| e.to_string())?,
            stock_kg: get_f64(&row, 2).map_err(|e| e.to_string())?,
            stock_cajas: get_i64(&row, 3).map_err(|e| e.to_string())?,
        });
    }
    Ok(stocks)
}
