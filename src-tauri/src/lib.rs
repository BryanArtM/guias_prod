mod db;
mod auth;

use db::*;
use auth::*;
#[allow(unused_imports)]
use tauri::State;

// Comandos Tauri - Productos
#[tauri::command]
fn crear_producto_cmd(state: State<AppState>, token: String, producto: Producto) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_producto(&conn, &producto).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_productos_cmd(state: State<AppState>, token: String) -> Result<Vec<Producto>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_productos(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_producto_cmd(state: State<AppState>, token: String, id: i64) -> Result<Producto, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_producto(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_producto_cmd(state: State<AppState>, token: String, id: i64, producto: Producto) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_producto(&conn, id, &producto).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_producto_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_producto(&conn, id).map_err(|e| e.to_string())
}

// Comandos Tauri - Guías
#[tauri::command]
fn crear_guia_cmd(state: State<AppState>, token: String, guia: Guia) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_guia(&conn, &guia).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_guias_cmd(state: State<AppState>, token: String) -> Result<Vec<Guia>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_guias(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_guia_cmd(state: State<AppState>, token: String, id: i64) -> Result<Guia, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_guia(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn actualizar_guia_cmd(state: State<AppState>, token: String, id: i64, guia: Guia) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    actualizar_guia(&conn, id, &guia).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_guia_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_guia(&conn, id).map_err(|e| e.to_string())
}

// Comandos Tauri - Guía Detalle
#[tauri::command]
fn crear_guia_detalle_cmd(state: State<AppState>, token: String, detalle: GuiaDetalle) -> Result<i64, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    crear_guia_detalle(&conn, &detalle).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_detalles_guia_cmd(state: State<AppState>, token: String, guia_id: i64) -> Result<Vec<GuiaDetalleConProducto>, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_detalles_guia(&conn, guia_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn eliminar_detalle_guia_cmd(state: State<AppState>, token: String, id: i64) -> Result<(), String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    eliminar_detalle_guia(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn obtener_guia_completa_cmd(state: State<AppState>, token: String, guia_id: i64) -> Result<GuiaCompleta, String> {
    require_auth(&token)?;
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    obtener_guia_completa(&conn, guia_id).map_err(|e| e.to_string())
}

// Comandos Tauri - Autenticación
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_conn = init_db().expect("Error al inicializar la base de datos");
    let app_state = AppState {
        db: std::sync::Mutex::new(db_conn),
    };

    tauri::Builder::default()
        .manage(app_state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            crear_producto_cmd,
            obtener_productos_cmd,
            obtener_producto_cmd,
            actualizar_producto_cmd,
            eliminar_producto_cmd,
            crear_guia_cmd,
            obtener_guias_cmd,
            obtener_guia_cmd,
            actualizar_guia_cmd,
            eliminar_guia_cmd,
            crear_guia_detalle_cmd,
            obtener_detalles_guia_cmd,
            eliminar_detalle_guia_cmd,
            obtener_guia_completa_cmd,
            register_cmd,
            login_cmd,
            verify_token_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

