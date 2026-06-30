mod auth;
mod db;

use auth::*;
use db::*;
use tauri::State;
use tauri::Manager;
use std::sync::Arc;
use libsql::Database;

// ============ ESTADO DE LA APLICACIÓN ============

pub struct AppState {
    pub db: Arc<Database>,
}

// ============ COMANDOS TAURI - ESPECIES ============

#[tauri::command]
async fn crear_especie_cmd(state: State<'_, AppState>, token: String, especie: Especie) -> Result<i64, String> {
    require_auth(&token)?;
    crear_especie(&state.db, &especie).await
}

#[tauri::command]
async fn obtener_especies_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Especie>, String> {
    require_auth(&token)?;
    obtener_especies(&state.db).await
}

#[tauri::command]
async fn obtener_especie_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<Especie, String> {
    require_auth(&token)?;
    obtener_especie(&state.db, id).await
}

#[tauri::command]
async fn actualizar_especie_cmd(state: State<'_, AppState>, token: String, id: i64, especie: Especie) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_especie(&state.db, id, &especie).await
}

#[tauri::command]
async fn eliminar_especie_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_especie(&state.db, id).await
}

// ============ COMANDOS TAURI - PRESENTACIONES ============

#[tauri::command]
async fn crear_presentacion_cmd(state: State<'_, AppState>, token: String, presentacion: Presentacion) -> Result<i64, String> {
    require_auth(&token)?;
    crear_presentacion(&state.db, &presentacion).await
}

#[tauri::command]
async fn obtener_presentaciones_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Presentacion>, String> {
    require_auth(&token)?;
    obtener_presentaciones(&state.db).await
}

#[tauri::command]
async fn obtener_presentaciones_por_especie_cmd(state: State<'_, AppState>, token: String, especie_id: i64) -> Result<Vec<Presentacion>, String> {
    require_auth(&token)?;
    println!("Tauri: obtener_presentaciones_por_especie_cmd - especie_id: {}", especie_id);
    let result = obtener_presentaciones_por_especie(&state.db, especie_id).await?;
    println!("Tauri: Encontradas {} presentaciones para especie {}", result.len(), especie_id);
    Ok(result)
}

#[tauri::command]
async fn actualizar_presentacion_cmd(state: State<'_, AppState>, token: String, id: i64, presentacion: Presentacion) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_presentacion(&state.db, id, &presentacion).await
}

#[tauri::command]
async fn eliminar_presentacion_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_presentacion(&state.db, id).await
}

// ============ COMANDOS TAURI - FORMAS DE ENVASADO ============

#[tauri::command]
async fn crear_forma_envasado_cmd(state: State<'_, AppState>, token: String, forma: FormaEnvasado) -> Result<i64, String> {
    require_auth(&token)?;
    crear_forma_envasado(&state.db, &forma).await
}

#[tauri::command]
async fn obtener_formas_envasado_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<FormaEnvasado>, String> {
    require_auth(&token)?;
    obtener_formas_envasado(&state.db).await
}

#[tauri::command]
async fn actualizar_forma_envasado_cmd(state: State<'_, AppState>, token: String, id: i64, forma: FormaEnvasado) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_forma_envasado(&state.db, id, &forma).await
}

#[tauri::command]
async fn eliminar_forma_envasado_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_forma_envasado(&state.db, id).await
}

// ============ COMANDOS TAURI - FORMAS DE EMPACADO ============

#[tauri::command]
async fn crear_forma_empacado_cmd(state: State<'_, AppState>, token: String, forma: FormaEmpacado) -> Result<i64, String> {
    require_auth(&token)?;
    crear_forma_empacado(&state.db, &forma).await
}

#[tauri::command]
async fn obtener_formas_empacado_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<FormaEmpacado>, String> {
    require_auth(&token)?;
    obtener_formas_empacado(&state.db).await
}

#[tauri::command]
async fn actualizar_forma_empacado_cmd(state: State<'_, AppState>, token: String, id: i64, forma: FormaEmpacado) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_forma_empacado(&state.db, id, &forma).await
}

#[tauri::command]
async fn eliminar_forma_empacado_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_forma_empacado(&state.db, id).await
}

// ============ COMANDOS TAURI - CALIDADES ============

#[tauri::command]
async fn crear_calidad_cmd(state: State<'_, AppState>, token: String, calidad: Calidad) -> Result<i64, String> {
    require_auth(&token)?;
    crear_calidad(&state.db, &calidad).await
}

#[tauri::command]
async fn obtener_calidades_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Calidad>, String> {
    require_auth(&token)?;
    obtener_calidades(&state.db).await
}

#[tauri::command]
async fn actualizar_calidad_cmd(state: State<'_, AppState>, token: String, id: i64, calidad: Calidad) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_calidad(&state.db, id, &calidad).await
}

#[tauri::command]
async fn eliminar_calidad_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_calidad(&state.db, id).await
}

// ============ COMANDOS TAURI - CALIBRES ============

#[tauri::command]
async fn crear_calibre_cmd(state: State<'_, AppState>, token: String, calibre: Calibre) -> Result<i64, String> {
    require_auth(&token)?;
    crear_calibre(&state.db, &calibre).await
}

#[tauri::command]
async fn obtener_calibres_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Calibre>, String> {
    require_auth(&token)?;
    obtener_calibres(&state.db).await
}

#[tauri::command]
async fn actualizar_calibre_cmd(state: State<'_, AppState>, token: String, id: i64, calibre: Calibre) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_calibre(&state.db, id, &calibre).await
}

#[tauri::command]
async fn eliminar_calibre_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_calibre(&state.db, id).await
}

// ============ COMANDOS TAURI - VARIANTES DE PRESENTACIONES ============

#[tauri::command]
async fn crear_variante_presentacion_cmd(state: State<'_, AppState>, token: String, variante: VariantePresentacion) -> Result<i64, String> {
    require_auth(&token)?;
    crear_variante_presentacion(&state.db, &variante).await
}

#[tauri::command]
async fn obtener_variantes_presentaciones_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<VariantePresentacion>, String> {
    require_auth(&token)?;
    obtener_variantes_presentaciones(&state.db).await
}

#[tauri::command]
async fn obtener_variantes_completas_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<VarianteCompleta>, String> {
    require_auth(&token)?;
    obtener_variantes_completas(&state.db).await
}

#[tauri::command]
async fn actualizar_variante_presentacion_cmd(state: State<'_, AppState>, token: String, id: i64, variante: VariantePresentacion) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_variante_presentacion(&state.db, id, &variante).await
}

#[tauri::command]
async fn eliminar_variante_presentacion_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_variante_presentacion(&state.db, id).await
}

// ============ COMANDOS TAURI - TIPOS DE INGRESO ============

#[tauri::command]
async fn obtener_tipos_ingreso_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<TipoIngreso>, String> {
    require_auth(&token)?;
    obtener_tipos_ingreso(&state.db).await
}

// ============ COMANDOS TAURI - INGRESOS ============

#[tauri::command]
async fn crear_ingreso_cmd(state: State<'_, AppState>, token: String, ingreso: Ingreso) -> Result<i64, String> {
    require_auth(&token)?;
    crear_ingreso(&state.db, &ingreso).await
}

#[tauri::command]
async fn obtener_ingresos_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Ingreso>, String> {
    require_auth(&token)?;
    obtener_ingresos(&state.db).await
}

#[tauri::command]
async fn obtener_ingresos_paginados_cmd(state: State<'_, AppState>, token: String, limite: i64, offset: i64) -> Result<Vec<Ingreso>, String> {
    require_auth(&token)?;
    obtener_ingresos_paginados(&state.db, limite, offset).await
}

#[tauri::command]
async fn contar_ingresos_cmd(state: State<'_, AppState>, token: String) -> Result<i64, String> {
    require_auth(&token)?;
    contar_ingresos(&state.db).await
}

#[tauri::command]
async fn crear_ingresos_batch_cmd(state: State<'_, AppState>, token: String, ingresos: Vec<Ingreso>) -> Result<Vec<i64>, String> {
    require_auth(&token)?;
    crear_ingresos_batch(&state.db, &ingresos).await
}

#[tauri::command]
async fn actualizar_ingreso_cmd(state: State<'_, AppState>, token: String, id: i64, ingreso: Ingreso) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_ingreso(&state.db, id, &ingreso).await
}

#[tauri::command]
async fn eliminar_ingreso_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_ingreso(&state.db, id).await
}

// ============ COMANDOS TAURI - TIPOS DE SALIDA ============

#[tauri::command]
async fn obtener_tipos_salida_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<TipoSalida>, String> {
    require_auth(&token)?;
    obtener_tipos_salida(&state.db).await
}

// ============ COMANDOS TAURI - SALIDAS ============

#[tauri::command]
async fn crear_salida_cmd(state: State<'_, AppState>, token: String, salida: Salida) -> Result<i64, String> {
    require_auth(&token)?;
    crear_salida(&state.db, &salida).await
}

#[tauri::command]
async fn obtener_salidas_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<Salida>, String> {
    require_auth(&token)?;
    obtener_salidas(&state.db).await
}

#[tauri::command]
async fn obtener_salidas_paginadas_cmd(state: State<'_, AppState>, token: String, limite: i64, offset: i64) -> Result<Vec<Salida>, String> {
    require_auth(&token)?;
    obtener_salidas_paginadas(&state.db, limite, offset).await
}

#[tauri::command]
async fn contar_salidas_cmd(state: State<'_, AppState>, token: String) -> Result<i64, String> {
    require_auth(&token)?;
    contar_salidas(&state.db).await
}

#[tauri::command]
async fn crear_salidas_batch_cmd(state: State<'_, AppState>, token: String, salidas: Vec<Salida>) -> Result<Vec<i64>, String> {
    require_auth(&token)?;
    crear_salidas_batch(&state.db, &salidas).await
}

#[tauri::command]
async fn actualizar_salida_cmd(state: State<'_, AppState>, token: String, id: i64, salida: Salida) -> Result<(), String> {
    require_auth(&token)?;
    actualizar_salida(&state.db, id, &salida).await
}

#[tauri::command]
async fn eliminar_salida_cmd(state: State<'_, AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    eliminar_salida(&state.db, id).await
}

// ============ COMANDOS TAURI - CONTROL DE SALIDA ============

#[tauri::command]
async fn crear_control_salida_cmd(state: State<'_, AppState>, token: String, controlSalida: ControlSalida) -> Result<i64, String> {
    require_auth(&token)?;
    crear_control_salida(&state.db, &controlSalida).await
}

// ============ COMANDOS TAURI - PARTES DE PRODUCCIÓN ============

#[tauri::command]
async fn crear_parte_produccion_cmd(state: State<'_, AppState>, token: String, parte: ParteProduccion) -> Result<i64, String> {
    require_auth(&token)?;
    crear_parte_produccion(&state.db, &parte).await
}

#[tauri::command]
async fn obtener_partes_produccion_cmd(state: State<'_, AppState>, token: String, tipo: Option<String>) -> Result<Vec<ParteProduccion>, String> {
    require_auth(&token)?;
    obtener_partes_produccion(&state.db, tipo).await
}

// ============ COMANDOS TAURI - CONSULTAS ============

#[tauri::command]
async fn obtener_stock_por_variante_cmd(state: State<'_, AppState>, token: String) -> Result<Vec<StockVariante>, String> {
    require_auth(&token)?;
    obtener_stock_por_variante(&state.db).await
}

// ============ COMANDOS TAURI - AUTENTICACIÓN ============

#[tauri::command]
async fn register_cmd(state: State<'_, AppState>, data: RegisterData) -> Result<AuthResponse, String> {
    register_user(&state.db, data).await
}

#[tauri::command]
async fn login_cmd(state: State<'_, AppState>, credentials: LoginCredentials) -> Result<AuthResponse, String> {
    login_user(&state.db, credentials).await
}

#[tauri::command]
async fn verify_token_cmd(state: State<'_, AppState>, user_id: i64) -> Result<User, String> {
    get_user_by_id(&state.db, user_id).await
}

// ============ APLICACIÓN PRINCIPAL ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
    let handle = app.handle().clone();
    
    tauri::async_runtime::spawn(async move {
        match init_db().await {
            Ok(db) => {
                println!("Base de datos inicializada correctamente");
                let app_state = AppState { db: Arc::new(db) };
                handle.manage(app_state);
            }
            Err(e) => {
                eprintln!("Error: {}", e);
                std::process::exit(1);
            }
        }
    });
    
    Ok(())
})
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Especies
            crear_especie_cmd,
            obtener_especies_cmd,
            obtener_especie_cmd,
            actualizar_especie_cmd,
            eliminar_especie_cmd,
            // Presentaciones
            crear_presentacion_cmd,
            obtener_presentaciones_cmd,
            obtener_presentaciones_por_especie_cmd,
            actualizar_presentacion_cmd,
            eliminar_presentacion_cmd,
            // Formas de envasado
            crear_forma_envasado_cmd,
            obtener_formas_envasado_cmd,
            actualizar_forma_envasado_cmd,
            eliminar_forma_envasado_cmd,
            // Formas de empacado
            crear_forma_empacado_cmd,
            obtener_formas_empacado_cmd,
            actualizar_forma_empacado_cmd,
            eliminar_forma_empacado_cmd,
            // Calidades
            crear_calidad_cmd,
            obtener_calidades_cmd,
            actualizar_calidad_cmd,
            eliminar_calidad_cmd,
            // Calibres
            crear_calibre_cmd,
            obtener_calibres_cmd,
            actualizar_calibre_cmd,
            eliminar_calibre_cmd,
            // Variantes de presentaciones
            crear_variante_presentacion_cmd,
            obtener_variantes_presentaciones_cmd,
            obtener_variantes_completas_cmd,
            actualizar_variante_presentacion_cmd,
            eliminar_variante_presentacion_cmd,
            // Tipos de ingreso
            obtener_tipos_ingreso_cmd,
            // Ingresos
            crear_ingreso_cmd,
            obtener_ingresos_cmd,
            obtener_ingresos_paginados_cmd,
            contar_ingresos_cmd,
            crear_ingresos_batch_cmd,
            actualizar_ingreso_cmd,
            eliminar_ingreso_cmd,
            // Tipos de salida
            obtener_tipos_salida_cmd,
            // Salidas
            crear_salida_cmd,
            obtener_salidas_cmd,
            obtener_salidas_paginadas_cmd,
            contar_salidas_cmd,
            crear_salidas_batch_cmd,
            actualizar_salida_cmd,
            eliminar_salida_cmd,
            // Control de salida
            crear_control_salida_cmd,
            // Partes de producción
            crear_parte_produccion_cmd,
            obtener_partes_produccion_cmd,
            // Consultas
            obtener_stock_por_variante_cmd,
            // Autenticación
            register_cmd,
            login_cmd,
            verify_token_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
