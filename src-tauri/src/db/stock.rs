use rusqlite::{Connection, Result};
use crate::db::types::StockVariante;

// CONSULTAS DE STOCK 

pub fn obtener_stock_por_variante(conn: &Connection) -> Result<Vec<StockVariante>> {
    // Usar la vista como base y hacer LEFT JOINs a ingresos/salidas
    let mut stmt = conn.prepare(
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
    )?;

    let stock_iter = stmt.query_map([], |row| {
        Ok(StockVariante {
            variante_id: row.get(0)?,
            codigo_completo: row.get(1)?,
            especie_nombre: row.get(2)?,
            presentacion_nombre: row.get(3)?,
            kg_ingresados: row.get(4)?,
            kg_salidos: row.get(5)?,
            kg_stock: row.get(6)?,
            cajas_ingresadas: row.get(7)?,
            cajas_salidas: row.get(8)?,
            cajas_stock: row.get(9)?,
        })
    })?;

    let mut stocks = Vec::new();
    for stock in stock_iter {
        stocks.push(stock?);
    }
    Ok(stocks)
}
