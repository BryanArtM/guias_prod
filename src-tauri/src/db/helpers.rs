// Helper functions para trabajar con libsql
use libsql::{Row, Value};

// Helper para obtener un valor i64 opcional de una fila
pub fn get_optional_i64(row: &Row, idx: i32) -> Result<Option<i64>, libsql::Error> {
    match row.get::<i64>(idx) {
        Ok(val) => Ok(Some(val)),
        Err(_) => Ok(None),
    }
}

// Helper para obtener un valor String opcional de una fila
pub fn get_optional_string(row: &Row, idx: i32) -> Result<Option<String>, libsql::Error> {
    match row.get::<String>(idx) {
        Ok(val) => Ok(Some(val)),
        Err(_) => Ok(None),
    }
}

// Helper para obtener un valor f64 opcional de una fila
pub fn get_optional_f64(row: &Row, idx: i32) -> Result<Option<f64>, libsql::Error> {
    match row.get::<f64>(idx) {
        Ok(val) => Ok(Some(val)),
        Err(_) => Ok(None),
    }
}

// Helper para obtener un valor i32 opcional de una fila
pub fn get_optional_i32(row: &Row, idx: i32) -> Result<Option<i32>, libsql::Error> {
    match row.get::<i32>(idx) {
        Ok(val) => Ok(Some(val)),
        Err(_) => Ok(None),
    }
}

// Helper para obtener un valor bool desde un entero
pub fn get_bool_from_int(row: &Row, idx: i32) -> Result<bool, libsql::Error> {
    let val: i64 = row.get(idx)?;
    Ok(val != 0)
}

// Helper para convertir Option<i64> a Value
pub fn option_i64_to_value(opt: Option<i64>) -> Value {
    match opt {
        Some(v) => Value::from(v),
        None => Value::Null,
    }
}

// Helper para convertir Option<String> a Value
pub fn option_string_to_value(opt: Option<String>) -> Value {
    match opt {
        Some(v) => Value::from(v),
        None => Value::Null,
    }
}

// Helper para convertir Option<f64> a Value
pub fn option_f64_to_value(opt: Option<f64>) -> Value {
    match opt {
        Some(v) => Value::from(v),
        None => Value::Null,
    }
}

// Helper para convertir Option<i32> a Value
pub fn option_i32_to_value(opt: Option<i32>) -> Value {
    match opt {
        Some(v) => Value::from(v as i64),
        None => Value::Null,
    }
}
