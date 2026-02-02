//Re-exportar módulos y funciones del módulo db
mod types;
mod init;
mod especies;
mod presentaciones;
mod formas;
mod calidades;
mod calibres;
mod variantes;
mod ingresos;
mod salidas;
mod stock;

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
    crear_ingreso,
    obtener_ingresos,
    actualizar_ingreso,
    eliminar_ingreso,
};

pub use salidas::{
    obtener_tipos_salida,
    crear_salida,
    obtener_salidas,
    actualizar_salida,
    eliminar_salida,
};

pub use stock::obtener_stock_por_variante;
