mod auth;
mod db;

use auth::*;
use db::*;
use tauri::State;
use tauri::Manager;

// ============ COMANDOS TAURI - ESPECIES ============

#[tauri::command]
fn crear_especie_cmd(state: State<AppState>, token: String, especie: Especie) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_especie(&conn, &especie).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_especies_cmd(state: State<AppState>, token: String) -> Result<Vec<Especie>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_especies(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_especie_cmd(state: State<AppState>, token: String, id: i64) -> Result<Especie, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_especie(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_especie_cmd(state: State<AppState>, token: String, id: i64, especie: Especie) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_especie(&conn, id, &especie).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_especie_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_especie(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - PRESENTACIONES ============

#[tauri::command]
fn crear_presentacion_cmd(state: State<AppState>, token: String, presentacion: Presentacion) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_presentacion(&conn, &presentacion).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_presentaciones_cmd(state: State<AppState>, token: String) -> Result<Vec<Presentacion>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_presentaciones(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_presentaciones_por_especie_cmd(state: State<AppState>, token: String, especie_id: i64) -> Result<Vec<Presentacion>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_presentaciones_por_especie(&conn, especie_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_presentacion_cmd(state: State<AppState>, token: String, id: i64, presentacion: Presentacion) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_presentacion(&conn, id, &presentacion).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_presentacion_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_presentacion(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - FORMAS DE ENVASADO ============

#[tauri::command]
fn crear_forma_envasado_cmd(state: State<AppState>, token: String, forma: FormaEnvasado) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_forma_envasado(&conn, &forma).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_formas_envasado_cmd(state: State<AppState>, token: String) -> Result<Vec<FormaEnvasado>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_formas_envasado(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_forma_envasado_cmd(state: State<AppState>, token: String, id: i64, forma: FormaEnvasado) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_forma_envasado(&conn, id, &forma).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_forma_envasado_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_forma_envasado(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - FORMAS DE EMPACADO ============

#[tauri::command]
fn crear_forma_empacado_cmd(state: State<AppState>, token: String, forma: FormaEmpacado) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_forma_empacado(&conn, &forma).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_formas_empacado_cmd(state: State<AppState>, token: String) -> Result<Vec<FormaEmpacado>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_formas_empacado(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_forma_empacado_cmd(state: State<AppState>, token: String, id: i64, forma: FormaEmpacado) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_forma_empacado(&conn, id, &forma).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_forma_empacado_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_forma_empacado(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - TIPOS DE ENSUNCHADO ============

#[tauri::command]
fn crear_tipo_ensunchado_cmd(state: State<AppState>, token: String, tipo: TipoEnsunchado) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_tipo_ensunchado(&conn, &tipo).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_tipos_ensunchado_cmd(state: State<AppState>, token: String) -> Result<Vec<TipoEnsunchado>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_tipos_ensunchado(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_tipo_ensunchado_cmd(state: State<AppState>, token: String, id: i64, tipo: TipoEnsunchado) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_tipo_ensunchado(&conn, id, &tipo).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_tipo_ensunchado_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_tipo_ensunchado(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - CALIDADES ============

#[tauri::command]
fn crear_calidad_cmd(state: State<AppState>, token: String, calidad: Calidad) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_calidad(&conn, &calidad).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_calidades_cmd(state: State<AppState>, token: String) -> Result<Vec<Calidad>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_calidades(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_calidad_cmd(state: State<AppState>, token: String, id: i64, calidad: Calidad) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_calidad(&conn, id, &calidad).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_calidad_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_calidad(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - CALIBRES ============

#[tauri::command]
fn crear_calibre_cmd(state: State<AppState>, token: String, calibre: Calibre) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_calibre(&conn, &calibre).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_calibres_cmd(state: State<AppState>, token: String) -> Result<Vec<Calibre>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_calibres(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_calibre_cmd(state: State<AppState>, token: String, id: i64, calibre: Calibre) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_calibre(&conn, id, &calibre).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_calibre_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_calibre(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - VARIANTES DE PRESENTACIONES ============

#[tauri::command]
fn crear_variante_presentacion_cmd(state: State<AppState>, token: String, variante: VariantePresentacion) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_variante_presentacion(&conn, &variante).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_variantes_presentaciones_cmd(state: State<AppState>, token: String) -> Result<Vec<VariantePresentacion>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_variantes_presentaciones(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_variantes_completas_cmd(state: State<AppState>, token: String) -> Result<Vec<VarianteCompleta>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_variantes_completas(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_variante_presentacion_cmd(state: State<AppState>, token: String, id: i64, variante: VariantePresentacion) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_variante_presentacion(&conn, id, &variante).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_variante_presentacion_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_variante_presentacion(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - TIPOS DE INGRESO ============

#[tauri::command]
fn obtener_tipos_ingreso_cmd(state: State<AppState>, token: String) -> Result<Vec<TipoIngreso>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_tipos_ingreso(&conn).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - INGRESOS ============

#[tauri::command]
fn crear_ingreso_cmd(state: State<AppState>, token: String, ingreso: Ingreso) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_ingreso(&conn, &ingreso).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_ingresos_cmd(state: State<AppState>, token: String) -> Result<Vec<Ingreso>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_ingresos(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_ingreso_cmd(state: State<AppState>, token: String, id: i64, ingreso: Ingreso) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_ingreso(&conn, id, &ingreso).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_ingreso_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_ingreso(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - TIPOS DE SALIDA ============

#[tauri::command]
fn obtener_tipos_salida_cmd(state: State<AppState>, token: String) -> Result<Vec<TipoSalida>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_tipos_salida(&conn).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - SALIDAS ============

#[tauri::command]
fn crear_salida_cmd(state: State<AppState>, token: String, salida: Salida) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_salida(&conn, &salida).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_salidas_cmd(state: State<AppState>, token: String) -> Result<Vec<Salida>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_salidas(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_salida_cmd(state: State<AppState>, token: String, id: i64, salida: Salida) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_salida(&conn, id, &salida).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_salida_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_salida(&conn, id).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - CONSULTAS ============

#[tauri::command]
fn obtener_stock_por_variante_cmd(state: State<AppState>, token: String) -> Result<Vec<StockVariante>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_stock_por_variante(&conn).map_err(|e| e.to_string())
}

// ============ COMANDOS TAURI - AUTENTICACIÓN ============

#[tauri::command]
fn register_cmd(state: State<AppState>, data: RegisterData) -> Result<AuthResponse, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    register_user(&conn, data)
}

#[tauri::command]
fn login_cmd(state: State<AppState>, credentials: LoginCredentials) -> Result<AuthResponse, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    login_user(&conn, credentials)
}

#[tauri::command]
fn verify_token_cmd(state: State<AppState>, user_id: i64) -> Result<User, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    get_user_by_id(&conn, user_id)
}

// ============ APLICACIÓN PRINCIPAL ============

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Obtener el AppHandle
            let app_handle = app.handle();
            
            // Inicializar la base de datos con la nueva ruta
            let db_conn = init_db(&app_handle)
                .expect("Error al inicializar la base de datos");
            
            println!("Base de datos inicializada correctamente");
            
            // Crear y gestionar el estado de la aplicación
            let app_state = AppState {
                db: std::sync::Mutex::new(db_conn),
            };
            
            app.manage(app_state);
            
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
            // Tipos de ensunchado
            crear_tipo_ensunchado_cmd,
            obtener_tipos_ensunchado_cmd,
            actualizar_tipo_ensunchado_cmd,
            eliminar_tipo_ensunchado_cmd,
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
            actualizar_ingreso_cmd,
            eliminar_ingreso_cmd,
            // Tipos de salida
            obtener_tipos_salida_cmd,
            // Salidas
            crear_salida_cmd,
            obtener_salidas_cmd,
            actualizar_salida_cmd,
            eliminar_salida_cmd,
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
