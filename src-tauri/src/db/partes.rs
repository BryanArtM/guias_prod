use libsql::{Database, Value};
use crate::db::types::ParteProduccion;
use crate::db::helpers::*;

pub async fn crear_parte_produccion(db: &Database, parte: &ParteProduccion) -> Result<i64, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    // 1. Insertar encabezado
    conn.execute(
        "INSERT INTO partes_produccion 
         (codigo, revision, version, cliente, fecha, turno, codigo_trazabilidad, especie_id, entera, observaciones, tipo_documento_id)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
        vec![
            option_string_to_value(parte.codigo.clone()),
            option_string_to_value(parte.revision.clone()),
            option_string_to_value(parte.version.clone()),
            option_string_to_value(parte.cliente.clone()),
            Value::from(parte.fecha.clone()),
            option_string_to_value(parte.turno.clone()),
            option_string_to_value(parte.codigo_trazabilidad.clone()),
            option_i64_to_value(parte.especie_id),
            option_f64_to_value(parte.entera),
            option_string_to_value(parte.observaciones.clone()),
            Value::from(parte.tipo_documento_id),
        ],
    ).await.map_err(|e| e.to_string())?;
    
    let parte_id = conn.last_insert_rowid();

    // 2. Insertar transportes y embarcaciones
    for transporte in &parte.transportes {
        conn.execute(
            "INSERT INTO parte_produccion_transporte (parte_id, num_guia, num_carro, placa) VALUES (?1, ?2, ?3, ?4)",
            vec![
                Value::from(parte_id),
                option_string_to_value(transporte.num_guia.clone()),
                option_string_to_value(transporte.num_carro.clone()),
                option_string_to_value(transporte.placa.clone()),
            ],
        ).await.map_err(|e| e.to_string())?;
        
        let transporte_id = conn.last_insert_rowid();
        
        for ep in &transporte.embarcaciones {
            conn.execute(
                "INSERT INTO parte_produccion_embarcacion (transporte_id, nombre_embarcacion_pesquera, matricula_embarcacion_pesquera, peso_total_kg) 
                 VALUES (?1, ?2, ?3, ?4)",
                vec![
                    Value::from(transporte_id),
                    option_string_to_value(ep.nombre_embarcacion_pesquera.clone()),
                    option_string_to_value(ep.matricula_embarcacion_pesquera.clone()),
                    option_f64_to_value(ep.peso_total_kg),
                ],
            ).await.map_err(|e| e.to_string())?;
        }
    }

    // 3. Insertar productos; el stock se calcula desde la vista en tiempo real.
    for producto in &parte.productos {
        conn.execute(
            "INSERT INTO parte_produccion_producto 
             (parte_id, variante_id, peso_unidad, cajas_carro_1, cajas_carro_2, cajas_carro_3, cajas_carro_4, peso_total_neto_kg, acumulado_presentacion, rendimiento)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            vec![
                Value::from(parte_id),
                Value::from(producto.variante_id),
                option_f64_to_value(producto.peso_unidad),
                Value::from(producto.cajas_carro_1 as i64),
                Value::from(producto.cajas_carro_2 as i64),
                Value::from(producto.cajas_carro_3 as i64),
                Value::from(producto.cajas_carro_4 as i64),
                option_f64_to_value(producto.peso_total_neto_kg),
                option_f64_to_value(producto.acumulado_presentacion),
                option_f64_to_value(producto.rendimiento),
            ],
        ).await.map_err(|e| e.to_string())?;

    }

    // 4. Insertar insumos
    for insumo in &parte.insumos {
        conn.execute(
            "INSERT INTO parte_produccion_insumo (parte_id, nombre, cantidad) VALUES (?1, ?2, ?3)",
            vec![
                Value::from(parte_id),
                option_string_to_value(insumo.nombre.clone()),
                option_i32_to_value(insumo.cantidad),
            ],
        ).await.map_err(|e| e.to_string())?;
    }

    Ok(parte_id)
}

pub async fn obtener_partes_produccion(db: &Database, tipo_documento_id: Option<i64>) -> Result<Vec<ParteProduccion>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    
    let (query, params) = if let Some(tipo_id) = tipo_documento_id {
        (
            "SELECT p.id, p.codigo, p.revision, p.version, p.cliente, p.fecha, p.turno, p.codigo_trazabilidad, p.especie_id, p.entera, p.observaciones, p.tipo_documento_id 
             FROM partes_produccion p WHERE p.tipo_documento_id = ?1 ORDER BY p.fecha DESC, p.id DESC",
            vec![Value::from(tipo_id)]
        )
    } else {
        (
            "SELECT id, codigo, revision, version, cliente, fecha, turno, codigo_trazabilidad, especie_id, entera, observaciones, tipo_documento_id 
             FROM partes_produccion ORDER BY fecha DESC, id DESC",
            vec![]
        )
    };

    let mut result = conn.query(query, params).await.map_err(|e| e.to_string())?;

    let mut partes = Vec::new();
    while let Some(row) = result.next().await.map_err(|e| e.to_string())? {
        let id: i64 = row.get(0).map_err(|e| e.to_string())?;
        

        partes.push(ParteProduccion {
            id: Some(id),
            codigo: get_optional_string(&row, 1).map_err(|e| e.to_string())?,
            revision: get_optional_string(&row, 2).map_err(|e| e.to_string())?,
            version: get_optional_string(&row, 3).map_err(|e| e.to_string())?,
            cliente: get_optional_string(&row, 4).map_err(|e| e.to_string())?,
            fecha: row.get(5).map_err(|e| e.to_string())?,
            turno: get_optional_string(&row, 6).map_err(|e| e.to_string())?,
            codigo_trazabilidad: get_optional_string(&row, 7).map_err(|e| e.to_string())?,
            especie_id: get_optional_i64(&row, 8).map_err(|e| e.to_string())?,
            entera: get_optional_f64(&row, 9).map_err(|e| e.to_string())?,
            observaciones: get_optional_string(&row, 10).map_err(|e| e.to_string())?,
            tipo_documento_id: row.get(11).map_err(|e| e.to_string())?,
            transportes: Vec::new(),
            productos: Vec::new(),
            insumos: Vec::new(),
        });
    }
    Ok(partes)
}
