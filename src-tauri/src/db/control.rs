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
                        (tipo_documento_id, numero_control, fecha, cliente, fecha_produccion, turno,
                            numero_lote, numero_camara, especie_id, motivo_salida_id, suma_cantidad, suma_total_kg, observaciones)
                        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
                        vec![
                                Value::from(control.tipo_documento_id),
                                Value::from(control.numero_control.clone()),
                                Value::from(control.fecha.clone()),
                                Value::from(control.cliente.clone()),
                                option_string_to_value(control.fecha_produccion.clone()),
                                option_string_to_value(control.turno.clone()),
                                option_string_to_value(control.numero_lote.clone()),
                                option_string_to_value(control.numero_camara.clone()),
                                Value::from(control.especie_id),
                                Value::from(control.motivo_salida),
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
        
    }

    conn.execute("COMMIT", ())
        .await
        .map_err(|e| e.to_string())?;

    Ok(control_id)
}