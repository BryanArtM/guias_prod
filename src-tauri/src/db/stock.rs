use libsql::Database;
use crate::db::types::StockVariante;

// CONSULTAS DE STOCK 

pub async fn obtener_stock_por_variante(db: &Database) -> Result<Vec<StockVariante>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut result = conn.query(
        "SELECT 
            v.variante_id,
            v.codigo_completo,
            v.especie_nombre,
            v.presentacion_nombre,
            CAST(COALESCE(ing.total_kg, 0.0) AS REAL) AS kg_ingresados,
            CAST(COALESCE(sal.total_kg, 0.0) AS REAL) AS kg_salidos,
            CAST(COALESCE(ing.total_kg, 0.0) - COALESCE(sal.total_kg, 0.0) AS REAL) AS kg_stock,
            CAST(COALESCE(ing.total_cajas, 0) AS INTEGER) AS cajas_ingresadas,
            CAST(COALESCE(sal.total_cajas, 0) AS INTEGER) AS cajas_salidas,
            CAST(COALESCE(ing.total_cajas, 0) - COALESCE(sal.total_cajas, 0) AS INTEGER) AS cajas_stock
         FROM variantes_completas_view v
         LEFT JOIN (
             SELECT variante_id, CAST(SUM(kg) AS REAL) AS total_kg, CAST(SUM(cajas) AS INTEGER) AS total_cajas
             FROM ingresos
             GROUP BY variante_id
         ) ing ON v.variante_id = ing.variante_id
         LEFT JOIN (
             SELECT variante_id, CAST(SUM(kg) AS REAL) AS total_kg, CAST(SUM(cajas) AS INTEGER) AS total_cajas
             FROM salidas
             GROUP BY variante_id
         ) sal ON v.variante_id = sal.variante_id
         ORDER BY v.especie_nombre, v.presentacion_nombre",
        (),
    ).await.map_err(|e| e.to_string())?;

    let mut stocks = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        stocks.push(StockVariante {
            variante_id: row.get(0).map_err(|e| e.to_string())?,
            codigo_completo: row.get(1).map_err(|e| e.to_string())?,
            especie_nombre: row.get(2).map_err(|e| e.to_string())?,
            presentacion_nombre: row.get(3).map_err(|e| e.to_string())?,
            kg_ingresados: row.get(4).map_err(|e| e.to_string())?,
            kg_salidos: row.get(5).map_err(|e| e.to_string())?,
            kg_stock: row.get(6).map_err(|e| e.to_string())?,
            cajas_ingresadas: row.get(7).map_err(|e| e.to_string())?,
            cajas_salidas: row.get(8).map_err(|e| e.to_string())?,
            cajas_stock: row.get(9).map_err(|e| e.to_string())?,
        });
    }
    Ok(stocks)
}
