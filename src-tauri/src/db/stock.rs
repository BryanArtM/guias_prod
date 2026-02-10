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
            COALESCE(SUM(i.kg), 0) AS kg_ingresados,
            COALESCE(SUM(s.kg), 0) AS kg_salidos,
            COALESCE(SUM(i.kg), 0) - COALESCE(SUM(s.kg), 0) AS kg_stock,
            COALESCE(SUM(i.cajas), 0) AS cajas_ingresadas,
            COALESCE(SUM(s.cajas), 0) AS cajas_salidas,
            COALESCE(SUM(i.cajas), 0) - COALESCE(SUM(s.cajas), 0) AS cajas_stock
         FROM variantes_completas_view v
         LEFT JOIN ingresos i ON v.variante_id = i.variante_id
         LEFT JOIN salidas s ON v.variante_id = s.variante_id
         GROUP BY v.variante_id, v.codigo_completo, v.especie_nombre, v.presentacion_nombre
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
