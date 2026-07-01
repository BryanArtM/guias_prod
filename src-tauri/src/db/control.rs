use libsql::{Database, Value};

use crate::db::helpers::option_string_to_value;
use crate::db::types::ControlSalida;

pub async fn crear_control_salida(
    db: &Database,
    control: &ControlSalida,
) -> Result<i64, String> {
    if control.items.is_empty() {
        return Err("Debe registrar al menos un ítem".to_string());
    }

    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("BEGIN TRANSACTION", ())
        .await
        .map_err(|e| e.to_string())?;

    let total_cantidad = control.items.iter().map(|item| item.cantidad).sum::<i32>();
    let total_kg = control.items.iter().map(|item| item.total_kg).sum::<f64>();

    let insert_result = conn
        .execute(
            "INSERT INTO controles_salida
            (tipo_documento, numero_control, fecha, usuario, fecha_produccion, turno,
              numero_lote, numero_camara, especie_id, motivo_salida, suma_cantidad, suma_total_kg, observaciones)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
            vec![
                Value::from(control.tipo_documento.clone()),
                Value::from(control.numero_control.clone()),
                Value::from(control.fecha.clone()),
                Value::from(control.usuario.clone()),
                option_string_to_value(control.fecha_produccion.clone()),
                option_string_to_value(control.turno.clone()),
                option_string_to_value(control.numero_lote.clone()),
                option_string_to_value(control.numero_camara.clone()),
                Value::from(control.especie_id),
                Value::from(control.motivo_salida.clone()),
                Value::from(total_cantidad as i64),
                Value::from(total_kg),
                option_string_to_value(control.observaciones.clone()),
            ],
        )
        .await;

    if let Err(error) = insert_result {
        conn.execute("ROLLBACK", ())
            .await
            .map_err(|rollback_error| rollback_error.to_string())?;
        return Err(error.to_string());
    }

    let control_id = conn.last_insert_rowid();

    for item in &control.items {
        if let Err(error) = conn.execute(
            "INSERT INTO control_salida_items
            (control_salida_id, numero_item, variante_id, codigo_trazabilidad, cantidad, peso_unidad, total_kg, observaciones)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            vec![
                Value::from(control_id),
                Value::from(item.numero_item as i64),
                Value::from(item.variante_id),
                option_string_to_value(item.codigo_trazabilidad.clone()),
                Value::from(item.cantidad as i64),
                Value::from(item.peso_unidad),
                Value::from(item.total_kg),
                option_string_to_value(item.observaciones.clone()),
            ],
        )
        .await
        {
            conn.execute("ROLLBACK", ())
                .await
                .map_err(|rollback_error| rollback_error.to_string())?;
            return Err(error.to_string());
        }
        
        let tipo_salida_id: i64 = conn.query(
            "SELECT id FROM tipos_salida WHERE codigo = ?1",
            vec![Value::from(control.tipo_documento.clone())],
        ).await.map_err(|e| e.to_string())?
        .next().await.map_err(|e| e.to_string())?
        .ok_or("tipo_documento no encontrado en tipos_salida")?
        .get(0).map_err(|e| e.to_string())?;

        if let Err(error) = conn.execute(
            "INSERT INTO salidas (variante_id, tipo_salida_id, fecha, kg, cajas, observaciones)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            vec![
                Value::from(item.variante_id),
                Value::from(tipo_salida_id),
                Value::from(control.fecha.clone()),
                Value::from(item.total_kg),
                Value::from(item.cantidad as i64),
                option_string_to_value(control.observaciones.clone()),
            ],
        )
        .await         
        {
            conn.execute("ROLLBACK", ())
                .await
                .map_err(|rollback_error| rollback_error.to_string())?;
            return Err(error.to_string());
        }
    }

    conn.execute("COMMIT", ())
        .await
        .map_err(|e| e.to_string())?;

    Ok(control_id)
}