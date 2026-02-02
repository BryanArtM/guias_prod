use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Especie {
    pub id: Option<i64>,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Presentacion {
    pub id: Option<i64>,
    pub especie_id: i64,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FormaEnvasado {
    pub id: Option<i64>,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FormaEmpacado {
    pub id: Option<i64>,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Calidad {
    pub id: Option<i64>,
    pub nombre: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Calibre {
    pub id: Option<i64>,
    pub valor_minimo: Option<i64>,
    pub valor_maximo: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariantePresentacion {
    pub id: Option<i64>,
    pub presentacion_id: i64,
    pub forma_envasado_id: Option<i64>,
    pub forma_empacado_id: Option<i64>,
    pub ensunchado: bool,
    pub calidad_id: Option<i64>,
    pub calibre_id: Option<i64>,
    pub observaciones: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VarianteCompleta {
    pub variante_id: i64,
    pub especie_id: i64,
    pub especie_nombre: String,
    pub presentacion_id: i64,
    pub presentacion_nombre: String,
    pub forma_envasado: Option<String>,
    pub forma_empacado: Option<String>,
    pub tipo_ensunchado: Option<String>,
    pub calidad: Option<String>,
    pub calibre: Option<String>,
    pub codigo_completo: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TipoIngreso {
    pub id: Option<i64>,
    pub codigo: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ingreso {
    pub id: Option<i64>,
    pub variante_id: i64,
    pub tipo_ingreso_id: i64,
    pub fecha: String,
    pub peso_total_lote: Option<f64>,
    pub kg: f64,
    pub cajas: i32,
    pub observaciones: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TipoSalida {
    pub id: Option<i64>,
    pub codigo: String,
    pub descripcion: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Salida {
    pub id: Option<i64>,
    pub variante_id: i64,
    pub tipo_salida_id: i64,
    pub fecha: String,
    pub kg: f64,
    pub cajas: i32,
    pub observaciones: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockVariante {
    pub variante_id: i64,
    pub codigo_completo: String,
    pub especie_nombre: String,
    pub presentacion_nombre: String,
    pub kg_ingresados: f64,
    pub kg_salidos: f64,
    pub kg_stock: f64,
    pub cajas_ingresadas: i32,
    pub cajas_salidas: i32,
    pub cajas_stock: i32,
}

pub struct AppState {
    pub db: Mutex<Connection>,
}
