use libsql::{Database, Value};

use crate::db::helpers::*;
use crate::db::types::{ControlSalida, ControlSalidaItem};

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

pub async fn obtener_control_salida_por_id(db: &Database, id: i64) -> Result<ControlSalida, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;

    let mut result = conn.query(
        "SELECT c.id, c.tipo_documento_id, td.codigo, c.numero_control, c.fecha, c.cliente,
                c.fecha_produccion, c.turno, c.numero_lote, c.numero_camara,
                c.especie_id, e.nombre, c.suma_cantidad, c.suma_total_kg,
                c.motivo_salida_id, ms.codigo, c.observaciones
         FROM controles_salida c
         LEFT JOIN tipos_documento_salida td ON td.id = c.tipo_documento_id
         LEFT JOIN especies e ON e.id = c.especie_id
         LEFT JOIN motivos_salida ms ON ms.id = c.motivo_salida_id
         WHERE c.id = ?1",
        vec![Value::from(id)],
    ).await.map_err(|e| e.to_string())?;

    let row = result.next().await.map_err(|e| e.to_string())?
        .ok_or_else(|| "Control de salida no encontrado".to_string())?;

    let control_id: i64 = row.get(0).map_err(|e| e.to_string())?;
    let mut control = ControlSalida {
        id: Some(control_id),
        tipo_documento_id: row.get(1).map_err(|e| e.to_string())?,
        tipo_documento_codigo: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
        numero_control: row.get(3).map_err(|e| e.to_string())?,
        fecha: row.get(4).map_err(|e| e.to_string())?,
        cliente: row.get(5).map_err(|e| e.to_string())?,
        fecha_produccion: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
        turno: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
        numero_lote: get_optional_string(&row, 8).map_err(|e| e.to_string())?,
        numero_camara: get_optional_string(&row, 9).map_err(|e| e.to_string())?,
        especie_id: row.get(10).map_err(|e| e.to_string())?,
        especie_nombre: get_optional_string(&row, 11).map_err(|e| e.to_string())?,
        suma_cantidad: row.get(12).map_err(|e| e.to_string())?,
        suma_total_kg: row.get(13).map_err(|e| e.to_string())?,
        motivo_salida: row.get(14).map_err(|e| e.to_string())?,
        motivo_salida_codigo: get_optional_string(&row, 15).map_err(|e| e.to_string())?,
        observaciones: get_optional_string(&row, 16).map_err(|e| e.to_string())?,
        items: Vec::new(),
    };

    let mut res_i = conn.query(
        "SELECT ci.id, ci.numero_item, ci.variante_id, ci.codigo_trazabilidad,
                ci.cantidad, ci.peso_unidad, ci.total_kg, ci.observaciones,
                vc.codigo_completo
         FROM control_salida_items ci
         LEFT JOIN variantes_completas_view vc ON vc.variante_id = ci.variante_id
         WHERE ci.control_salida_id = ?1
         ORDER BY ci.numero_item",
        vec![Value::from(control_id)],
    ).await.map_err(|e| e.to_string())?;

    while let Some(row_i) = res_i.next().await.map_err(|e| e.to_string())? {
        control.items.push(ControlSalidaItem {
            id: Some(row_i.get(0).map_err(|e| e.to_string())?),
            control_salida_id: Some(control_id),
            numero_item: row_i.get(1).map_err(|e| e.to_string())?,
            variante_id: row_i.get(2).map_err(|e| e.to_string())?,
            codigo_trazabilidad: get_optional_string(&row_i, 3).map_err(|e| e.to_string())?,
            cantidad: row_i.get(4).map_err(|e| e.to_string())?,
            peso_unidad: row_i.get(5).map_err(|e| e.to_string())?,
            total_kg: row_i.get(6).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row_i, 7).map_err(|e| e.to_string())?,
            codigo_completo: get_optional_string(&row_i, 8).map_err(|e| e.to_string())?,
        });
    }

    Ok(control)
}

pub async fn actualizar_control_salida(db: &Database, id: i64, control: &ControlSalida) -> Result<(), String> {
    if control.items.is_empty() {
        return Err("Debe registrar al menos un ítem".to_string());
    }

    let conn = db.connect().map_err(|e| e.to_string())?;
    conn.execute("BEGIN TRANSACTION", ()).await.map_err(|e| e.to_string())?;

    let total_cantidad = control.items.iter().map(|item| item.cantidad).sum::<i32>();
    let total_kg = control.items.iter().map(|item| item.total_kg).sum::<f64>();

    let update_result = conn.execute(
        "UPDATE controles_salida SET
            tipo_documento_id = ?1, numero_control = ?2, fecha = ?3, cliente = ?4,
            fecha_produccion = ?5, turno = ?6, numero_lote = ?7, numero_camara = ?8,
            especie_id = ?9, motivo_salida_id = ?10, suma_cantidad = ?11, suma_total_kg = ?12,
            observaciones = ?13
         WHERE id = ?14",
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
            Value::from(id),
        ],
    ).await;

    if let Err(error) = update_result {
        conn.execute("ROLLBACK", ()).await.map_err(|e| e.to_string())?;
        return Err(error.to_string());
    }

    if let Err(error) = conn.execute(
        "DELETE FROM control_salida_items WHERE control_salida_id = ?1",
        vec![Value::from(id)],
    ).await {
        conn.execute("ROLLBACK", ()).await.map_err(|e| e.to_string())?;
        return Err(error.to_string());
    }

    for item in &control.items {
        if let Err(error) = conn.execute(
            "INSERT INTO control_salida_items
             (control_salida_id, numero_item, variante_id, codigo_trazabilidad, cantidad, peso_unidad, total_kg, observaciones)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            vec![
                Value::from(id),
                Value::from(item.numero_item as i64),
                Value::from(item.variante_id),
                option_string_to_value(item.codigo_trazabilidad.clone()),
                Value::from(item.cantidad as i64),
                Value::from(item.peso_unidad),
                Value::from(item.total_kg),
                option_string_to_value(item.observaciones.clone()),
            ],
        ).await {
            conn.execute("ROLLBACK", ()).await.map_err(|e| e.to_string())?;
            return Err(error.to_string());
        }
    }

    conn.execute("COMMIT", ()).await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn eliminar_control_salida(db: &Database, id: i64) -> Result<(), String> {
    let conn = db.connect().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM control_salida_items WHERE control_salida_id = ?1",
        vec![Value::from(id)],
    ).await.map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM controles_salida WHERE id = ?1",
        vec![Value::from(id)],
    ).await.map_err(|e| e.to_string())?;

    Ok(())
}
