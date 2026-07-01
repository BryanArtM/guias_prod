use serde::{Deserialize, Serialize};

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
pub struct ControlSalidaItem {
    pub id: Option<i64>,
    pub control_salida_id: Option<i64>,
    pub numero_item: i32,
    pub variante_id: i64,
    pub codigo_trazabilidad: Option<String>,
    pub cantidad: i32,
    pub peso_unidad: f64,
    pub total_kg: f64,
    pub observaciones: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ControlSalida {
    pub id: Option<i64>,
    pub tipo_documento: String,
    pub numero_control: String,
    pub fecha: String,
    pub usuario: String,
    pub fecha_produccion: Option<String>,
    pub turno: Option<String>,
    pub numero_lote: Option<String>,
    pub numero_camara: Option<String>,
    pub especie_id: i64,
    pub suma_cantidad: i32,
    pub suma_total_kg: f64,
    pub motivo_salida: String,
    pub observaciones: Option<String>,
    pub items: Vec<ControlSalidaItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParteProduccion {
    pub id: Option<i64>,
    pub codigo: Option<String>,
    pub revision: Option<String>,
    pub version: Option<String>,
    pub usuario: Option<String>,
    pub fecha: String,
    pub turno: Option<String>,
    pub codigo_trazabilidad: Option<String>,
    pub especie_id: Option<i64>,
    pub entera: Option<f64>,
    pub observaciones: Option<String>,
    pub tipo_documento: String, // 'PRODUCCION', 'DESEMBARQUE', 'DIRIMENCIA'
    pub transportes: Vec<ParteProduccionTransporte>,
    pub productos: Vec<ParteProduccionProducto>,
    pub insumos: Vec<ParteProduccionInsumo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParteProduccionTransporte {
    pub id: Option<i64>,
    pub num_guia: Option<String>,
    pub num_carro: Option<String>,
    pub placa: Option<String>,
    pub embarcaciones: Vec<ParteProduccionEmbarcacion>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParteProduccionEmbarcacion {
    pub id: Option<i64>,
    pub nombre_embarcacion_pesquera: Option<String>,
    pub matricula_embarcacion_pesquera: Option<String>,
    pub peso_total_kg: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParteProduccionProducto {
    pub id: Option<i64>,
    pub variante_id: i64,
    pub peso_unidad: Option<f64>,
    pub cajas_carro_1: i32,
    pub cajas_carro_2: i32,
    pub cajas_carro_3: i32,
    pub cajas_carro_4: i32,
    pub peso_total_neto_kg: Option<f64>,
    pub acumulado_presentacion: Option<f64>,
    pub rendimiento: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParteProduccionInsumo {
    pub id: Option<i64>,
    pub nombre: Option<String>,
    pub cantidad: Option<i32>,
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
