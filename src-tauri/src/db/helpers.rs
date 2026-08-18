// Helper functions para trabajar con libsql
use libsql::{Row, Value};

// El driver hace unreachable!() si el tipo de la columna no coincide exactamente
// con el solicitado (por ejemplo, leer un INTEGER como f64), lo que aborta el hilo
// en vez de devolver un error. Estos helpers leen el Value crudo y convierten
// entre INTEGER/REAL/TEXT, de modo que un desajuste degrade con elegancia.

// Helper para obtener un valor i64 de una fila, aceptando INTEGER o REAL
pub fn get_i64(row: &Row, idx: i32) -> Result<i64, libsql::Error> {
    match row.get_value(idx)? {
        Value::Integer(v) => Ok(v),
        Value::Real(v) => Ok(v as i64),
        Value::Text(v) => v.parse::<i64>().map_err(|_| libsql::Error::NullValue),
        _ => Err(libsql::Error::NullValue),
    }
}

// Helper para obtener un valor f64 de una fila, aceptando REAL o INTEGER
pub fn get_f64(row: &Row, idx: i32) -> Result<f64, libsql::Error> {
    match row.get_value(idx)? {
        Value::Real(v) => Ok(v),
        Value::Integer(v) => Ok(v as f64),
        Value::Text(v) => v.parse::<f64>().map_err(|_| libsql::Error::NullValue),
        _ => Err(libsql::Error::NullValue),
    }
}

// Helper para obtener un valor i64 opcional de una fila
pub fn get_optional_i64(row: &Row, idx: i32) -> Result<Option<i64>, libsql::Error> {
    Ok(get_i64(row, idx).ok())
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
    Ok(get_f64(row, idx).ok())
}

// Helper para obtener un valor i32 opcional de una fila
pub fn get_optional_i32(row: &Row, idx: i32) -> Result<Option<i32>, libsql::Error> {
    Ok(get_i64(row, idx).ok().map(|v| v as i32))
}

// Helper para obtener un valor bool desde un entero
pub fn get_bool_from_int(row: &Row, idx: i32) -> Result<bool, libsql::Error> {
    Ok(get_i64(row, idx)? != 0)
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
