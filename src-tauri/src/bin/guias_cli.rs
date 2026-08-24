// CLI para operar el sistema (ingresos, salidas y catálogos) sin pasar por la
// interfaz gráfica. Llama exactamente a las mismas funciones de negocio que
// usan los comandos de Tauri (src-tauri/src/db/*), conectándose a la misma
// base de datos Turso configurada en .env. No requiere login: corre en el
// mismo entorno de confianza que ya usa la app de escritorio.

use clap::{Parser, Subcommand};
use guias_produccion_lib::db::{
    self, Calibre, Calidad, ControlSalida, Especie, ParteProduccion, Presentacion,
    VariantePresentacion,
};
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::path::PathBuf;
use std::process::ExitCode;

#[derive(Parser)]
#[command(
    name = "guias_cli",
    about = "Opera el sistema de guías de producción desde la terminal (ingresos, salidas, catálogos)",
    version
)]
struct Cli {
    #[command(subcommand)]
    comando: Comando,
}

#[derive(Subcommand)]
enum Comando {
    /// Crea/migra tablas, vistas e índices (igual que hace la app al arrancar).
    /// Ejecutar una vez después de cambios de esquema; el resto de los comandos
    /// solo se conectan, sin repetir esta configuración en cada llamada.
    Setup,
    /// Catálogo de especies
    Especie {
        #[command(subcommand)]
        accion: EspecieAccion,
    },
    /// Catálogo de presentaciones
    Presentacion {
        #[command(subcommand)]
        accion: PresentacionAccion,
    },
    /// Catálogo de calidades
    Calidad {
        #[command(subcommand)]
        accion: CalidadAccion,
    },
    /// Catálogo de calibres
    Calibre {
        #[command(subcommand)]
        accion: CalibreAccion,
    },
    /// Catálogo de variantes (presentación + calidad + calibre + ensunchado)
    Variante {
        #[command(subcommand)]
        accion: VarianteAccion,
    },
    /// Ingresos (partes de producción / producto empacado)
    Ingreso {
        #[command(subcommand)]
        accion: IngresoAccion,
    },
    /// Salidas (control de salida)
    Salida {
        #[command(subcommand)]
        accion: SalidaAccion,
    },
    /// Consultas de stock (mismas que usan el Dashboard y la página de Stock)
    Stock {
        #[command(subcommand)]
        accion: StockAccion,
    },
    /// Consultas que alimentan la vista de Reportes
    Reporte {
        #[command(subcommand)]
        accion: ReporteAccion,
    },
    /// Catálogos de referencia de solo lectura (motivos, tipos de documento)
    Referencia {
        #[command(subcommand)]
        accion: ReferenciaAccion,
    },
}

#[derive(Subcommand)]
enum ReporteAccion {
    /// Movimientos de inventario (ingresos y salidas) en orden cronológico
    Movimientos {
        #[arg(long)]
        desde: Option<String>,
        #[arg(long)]
        hasta: Option<String>,
        #[arg(long)]
        especie_id: Option<i64>,
        #[arg(long)]
        variante_id: Option<i64>,
    },
    /// Materia prima recibida por día
    MateriaPrima {
        #[arg(long)]
        desde: Option<String>,
        #[arg(long)]
        hasta: Option<String>,
        #[arg(long)]
        especie_id: Option<i64>,
    },
}

#[derive(Subcommand)]
enum StockAccion {
    /// Stock neto por variante (lo que consume la página de Stock)
    Actual,
    /// Stock detallado con ingresos/salidas por variante (lo que consume el Dashboard)
    Detalle,
    /// Stock por lote: variante + fecha de ingreso, de la mas antigua a la mas reciente
    Lotes,
}

#[derive(Subcommand)]
enum EspecieAccion {
    Crear {
        #[arg(long)]
        nombre: String,
        #[arg(long)]
        descripcion: Option<String>,
        #[arg(long)]
        peso_unidad_defecto: Option<f64>,
        /// Dos letras que se incrustan en el codigo de trazabilidad (ej: PR)
        #[arg(long)]
        abreviatura_trazabilidad: Option<String>,
    },
    Listar,
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum PresentacionAccion {
    Crear {
        #[arg(long)]
        especie_id: i64,
        #[arg(long)]
        nombre: String,
        #[arg(long)]
        descripcion: Option<String>,
    },
    Listar {
        #[arg(long)]
        especie_id: Option<i64>,
    },
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum CalidadAccion {
    Crear {
        #[arg(long)]
        nombre: String,
        #[arg(long)]
        descripcion: Option<String>,
    },
    Listar,
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum CalibreAccion {
    Crear {
        #[arg(long)]
        minimo: Option<String>,
        #[arg(long)]
        maximo: Option<String>,
    },
    Listar,
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum VarianteAccion {
    Crear {
        #[arg(long)]
        presentacion_id: i64,
        #[arg(long)]
        calidad_id: Option<i64>,
        #[arg(long)]
        calibre_id: Option<i64>,
        /// Marca la variante como ensunchada (Z)
        #[arg(long, default_value_t = false)]
        ensunchado: bool,
    },
    /// Lista variantes completas (código legible incluido); filtra por especie si se indica
    Listar {
        #[arg(long)]
        especie_id: Option<i64>,
    },
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum IngresoAccion {
    /// Crea un ingreso a partir de un archivo JSON con la forma de ParteProduccion.
    /// peso_total_neto_kg, acumulado_presentacion y rendimiento de cada producto
    /// se recalculan automáticamente (no hace falta calcularlos a mano).
    Crear {
        #[arg(long)]
        archivo: PathBuf,
    },
    Actualizar {
        #[arg(long)]
        id: i64,
        #[arg(long)]
        archivo: PathBuf,
    },
    Listar {
        #[arg(long)]
        tipo_documento_id: Option<i64>,
    },
    Ver {
        #[arg(long)]
        id: i64,
    },
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum SalidaAccion {
    /// Crea una salida a partir de un archivo JSON con la forma de ControlSalida.
    /// total_kg de cada ítem, suma_cantidad y suma_total_kg se recalculan automáticamente.
    Crear {
        #[arg(long)]
        archivo: PathBuf,
    },
    Actualizar {
        #[arg(long)]
        id: i64,
        #[arg(long)]
        archivo: PathBuf,
    },
    Listar,
    Ver {
        #[arg(long)]
        id: i64,
    },
    Eliminar {
        #[arg(long)]
        id: i64,
    },
}

#[derive(Subcommand)]
enum ReferenciaAccion {
    MotivosIngreso,
    MotivosSalida,
    TiposDocumentoProduccion,
    TiposDocumentoSalida,
    FormasEnvasado,
    FormasEmpacado,
}

fn imprimir<T: Serialize>(valor: &T) {
    match serde_json::to_string_pretty(valor) {
        Ok(texto) => println!("{}", texto),
        Err(e) => eprintln!("Error al serializar la respuesta: {}", e),
    }
}

fn leer_json<T: DeserializeOwned>(ruta: &PathBuf) -> Result<T, String> {
    let contenido = std::fs::read_to_string(ruta)
        .map_err(|e| format!("No se pudo leer {}: {}", ruta.display(), e))?;
    serde_json::from_str(&contenido)
        .map_err(|e| format!("JSON inválido en {}: {}", ruta.display(), e))
}

fn calcular_total_recepcion(parte: &ParteProduccion) -> f64 {
    parte
        .transportes
        .iter()
        .flat_map(|t| t.embarcaciones.iter())
        .map(|e| e.peso_total_kg.unwrap_or(0.0))
        .sum()
}

// Recalcula los campos derivados de cada producto (igual que hace el formulario
// de la interfaz) para no depender de que el JSON de entrada los traiga correctos.
fn completar_productos(parte: &mut ParteProduccion) {
    let total_recepcion = calcular_total_recepcion(parte);
    for producto in parte.productos.iter_mut() {
        let total_cajas: i32 = producto.cajas_carros.iter().sum();
        let peso_unidad = producto.peso_unidad.unwrap_or(0.0);
        let total_neto = total_cajas as f64 * peso_unidad;

        producto.peso_total_neto_kg = Some(total_neto);
        producto.acumulado_presentacion = Some(total_neto);
        producto.rendimiento = Some(if total_recepcion > 0.0 {
            total_neto * 100.0 / total_recepcion
        } else {
            0.0
        });
    }
}

// Recalcula total_kg de cada ítem (cantidad * peso_unidad), igual que hace el
// formulario de control de salida.
fn completar_items(control: &mut ControlSalida) {
    for item in control.items.iter_mut() {
        item.total_kg = item.cantidad as f64 * item.peso_unidad;
    }
}

fn main() -> ExitCode {
    let cli = Cli::parse();

    // libsql genera cadenas de futures muy profundas; con el stack por defecto
    // (chico en compilaciones debug) revienta con "stack overflow" al conectar.
    // Se corre en un hilo con stack ampliado para que funcione en debug y release.
    let resultado = std::thread::Builder::new()
        .stack_size(32 * 1024 * 1024)
        .spawn(move || {
            let runtime =
                tokio::runtime::Runtime::new().expect("no se pudo iniciar el runtime async");
            runtime.block_on(ejecutar(cli))
        })
        .expect("no se pudo crear el hilo principal")
        .join()
        .expect("el hilo principal entró en pánico");

    match resultado {
        Ok(()) => ExitCode::SUCCESS,
        Err(mensaje) => {
            eprintln!("Error: {}", mensaje);
            ExitCode::FAILURE
        }
    }
}

async fn ejecutar(cli: Cli) -> Result<(), String> {
    if matches!(cli.comando, Comando::Setup) {
        db::init_db().await.map_err(|e| e.to_string())?;
        imprimir(&serde_json::json!({ "setup": "ok" }));
        return Ok(());
    }

    let base_datos = db::connect_db().await.map_err(|e| e.to_string())?;

    match cli.comando {
        Comando::Setup => unreachable!(),
        Comando::Especie { accion } => match accion {
            EspecieAccion::Crear {
                nombre,
                descripcion,
                peso_unidad_defecto,
                abreviatura_trazabilidad,
            } => {
                let id = db::crear_especie(
                    &base_datos,
                    &Especie {
                        id: None,
                        nombre,
                        descripcion,
                        peso_unidad_defecto,
                        abreviatura_trazabilidad,
                    },
                )
                .await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            EspecieAccion::Listar => imprimir(&db::obtener_especies(&base_datos).await?),
            EspecieAccion::Eliminar { id } => {
                db::eliminar_especie(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Presentacion { accion } => match accion {
            PresentacionAccion::Crear {
                especie_id,
                nombre,
                descripcion,
            } => {
                let id = db::crear_presentacion(
                    &base_datos,
                    &Presentacion {
                        id: None,
                        especie_id,
                        nombre,
                        descripcion,
                    },
                )
                .await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            PresentacionAccion::Listar { especie_id } => {
                let datos = match especie_id {
                    Some(eid) => db::obtener_presentaciones_por_especie(&base_datos, eid).await?,
                    None => db::obtener_presentaciones(&base_datos).await?,
                };
                imprimir(&datos);
            }
            PresentacionAccion::Eliminar { id } => {
                db::eliminar_presentacion(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Calidad { accion } => match accion {
            CalidadAccion::Crear {
                nombre,
                descripcion,
            } => {
                let id = db::crear_calidad(
                    &base_datos,
                    &Calidad {
                        id: None,
                        nombre,
                        descripcion,
                    },
                )
                .await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            CalidadAccion::Listar => imprimir(&db::obtener_calidades(&base_datos).await?),
            CalidadAccion::Eliminar { id } => {
                db::eliminar_calidad(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Calibre { accion } => match accion {
            CalibreAccion::Crear { minimo, maximo } => {
                let id = db::crear_calibre(
                    &base_datos,
                    &Calibre {
                        id: None,
                        valor_minimo: minimo,
                        valor_maximo: maximo,
                    },
                )
                .await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            CalibreAccion::Listar => imprimir(&db::obtener_calibres(&base_datos).await?),
            CalibreAccion::Eliminar { id } => {
                db::eliminar_calibre(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Variante { accion } => match accion {
            VarianteAccion::Crear {
                presentacion_id,
                calidad_id,
                calibre_id,
                ensunchado,
            } => {
                let id = db::crear_variante_presentacion(
                    &base_datos,
                    &VariantePresentacion {
                        id: None,
                        presentacion_id,
                        ensunchado,
                        calidad_id,
                        calibre_id,
                    },
                )
                .await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            VarianteAccion::Listar { especie_id } => {
                let mut datos = db::obtener_variantes_completas(&base_datos).await?;
                if let Some(eid) = especie_id {
                    datos.retain(|v| v.especie_id == eid);
                }
                imprimir(&datos);
            }
            VarianteAccion::Eliminar { id } => {
                db::eliminar_variante_presentacion(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Ingreso { accion } => match accion {
            IngresoAccion::Crear { archivo } => {
                let mut parte: ParteProduccion = leer_json(&archivo)?;
                completar_productos(&mut parte);
                let id = db::crear_parte_produccion(&base_datos, &parte, parte.usuario_id).await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            IngresoAccion::Actualizar { id, archivo } => {
                let mut parte: ParteProduccion = leer_json(&archivo)?;
                completar_productos(&mut parte);
                db::actualizar_parte_produccion(&base_datos, id, &parte).await?;
                imprimir(&serde_json::json!({ "actualizado": id }));
            }
            IngresoAccion::Listar { tipo_documento_id } => {
                imprimir(&db::obtener_partes_produccion(&base_datos, tipo_documento_id).await?);
            }
            IngresoAccion::Ver { id } => {
                imprimir(&db::obtener_parte_produccion_por_id(&base_datos, id).await?);
            }
            IngresoAccion::Eliminar { id } => {
                db::eliminar_parte_produccion(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Salida { accion } => match accion {
            SalidaAccion::Crear { archivo } => {
                let mut control: ControlSalida = leer_json(&archivo)?;
                completar_items(&mut control);
                let id = db::crear_control_salida(&base_datos, &control, control.usuario_id).await?;
                imprimir(&serde_json::json!({ "id": id }));
            }
            SalidaAccion::Actualizar { id, archivo } => {
                let mut control: ControlSalida = leer_json(&archivo)?;
                completar_items(&mut control);
                db::actualizar_control_salida(&base_datos, id, &control).await?;
                imprimir(&serde_json::json!({ "actualizado": id }));
            }
            SalidaAccion::Listar => imprimir(&db::obtener_salidas(&base_datos).await?),
            SalidaAccion::Ver { id } => {
                imprimir(&db::obtener_control_salida_por_id(&base_datos, id).await?);
            }
            SalidaAccion::Eliminar { id } => {
                db::eliminar_control_salida(&base_datos, id).await?;
                imprimir(&serde_json::json!({ "eliminado": id }));
            }
        },

        Comando::Stock { accion } => match accion {
            StockAccion::Actual => imprimir(&db::obtener_stock_actual(&base_datos).await?),
            StockAccion::Detalle => {
                imprimir(&db::obtener_stock_por_variante(&base_datos).await?)
            }
            StockAccion::Lotes => imprimir(&db::obtener_stock_por_lote(&base_datos).await?),
        },

        Comando::Reporte { accion } => match accion {
            ReporteAccion::Movimientos {
                desde,
                hasta,
                especie_id,
                variante_id,
            } => imprimir(
                &db::obtener_movimientos(&base_datos, desde, hasta, especie_id, variante_id)
                    .await?,
            ),
            ReporteAccion::MateriaPrima {
                desde,
                hasta,
                especie_id,
            } => imprimir(
                &db::obtener_materia_prima_por_fecha(&base_datos, desde, hasta, especie_id).await?,
            ),
        },

        Comando::Referencia { accion } => match accion {
            ReferenciaAccion::MotivosIngreso => {
                imprimir(&db::obtener_motivos_ingreso(&base_datos).await?)
            }
            ReferenciaAccion::MotivosSalida => {
                imprimir(&db::obtener_motivos_salida(&base_datos).await?)
            }
            ReferenciaAccion::TiposDocumentoProduccion => {
                imprimir(&db::obtener_tipos_documento_produccion(&base_datos).await?)
            }
            ReferenciaAccion::TiposDocumentoSalida => {
                imprimir(&db::obtener_tipos_documento_salida(&base_datos).await?)
            }
            ReferenciaAccion::FormasEnvasado => {
                imprimir(&db::obtener_formas_envasado(&base_datos).await?)
            }
            ReferenciaAccion::FormasEmpacado => {
                imprimir(&db::obtener_formas_empacado(&base_datos).await?)
            }
        },
    }

    Ok(())
}
