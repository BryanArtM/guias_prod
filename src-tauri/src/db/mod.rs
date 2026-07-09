//Re-exportar módulos y funciones del módulo db
mod types;
mod init;
mod helpers;
mod especies;
mod presentaciones;
mod formas;
mod calidades;
mod calibres;
mod variantes;
mod tipos_documento_produccion;
mod motivos_salida;
mod tipos_documento_salida;
mod ingresos;
mod salidas;
mod control;
mod stock;
mod partes;

pub use types::*;

pub use init::init_db;

pub use especies::{
    crear_especie,
    obtener_especies,
    obtener_especie,
    actualizar_especie,
    eliminar_especie,
};

pub use presentaciones::{
    crear_presentacion,
    obtener_presentaciones,
    obtener_presentaciones_por_especie,
    actualizar_presentacion,
    eliminar_presentacion,
};

pub use formas::{
    crear_forma_envasado,
    obtener_formas_envasado,
    actualizar_forma_envasado,
    eliminar_forma_envasado,
    crear_forma_empacado,
    obtener_formas_empacado,
    actualizar_forma_empacado,
    eliminar_forma_empacado,
};

pub use calidades::{
    crear_calidad,
    obtener_calidades,
    actualizar_calidad,
    eliminar_calidad,
};

pub use calibres::{
    crear_calibre,
    obtener_calibres,
    actualizar_calibre,
    eliminar_calibre,
};

pub use variantes::{
    crear_variante_presentacion,
    obtener_variantes_presentaciones,
    obtener_variantes_completas,
    actualizar_variante_presentacion,
    eliminar_variante_presentacion,
};

pub use ingresos::{
    obtener_tipos_ingreso,
    obtener_ingresos,
    obtener_ingresos_paginados,
    contar_ingresos,
};

pub use salidas::{
    obtener_tipos_salida,
    obtener_salidas,
    obtener_salidas_paginadas,
    contar_salidas,
};

pub use control::{
    crear_control_salida,
};

pub use tipos_documento_produccion::obtener_tipos_documento_produccion;
pub use motivos_salida::obtener_motivos_salida;
pub use tipos_documento_salida::obtener_tipos_documento_salida;

pub use stock::{obtener_stock_por_variante, obtener_stock_actual};

pub use partes::{
    crear_parte_produccion,
    obtener_partes_produccion,
    obtener_parte_produccion_por_id,
};

