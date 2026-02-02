use rusqlite::{Connection, Result};
use tauri::AppHandle;
use std::path::PathBuf;
use tauri::Manager;
use crate::auth;

pub fn get_db_path(app_handle: &AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("No se pudo obtener el directorio de datos de la app");
    
    std::fs::create_dir_all(&app_dir).expect("No se pudo crear el directorio");
    
    let db_path = app_dir.join("inventario_produccion.db");
    
    db_path
}


pub fn init_db(app_handle: &AppHandle) -> Result<Connection> {
    let db_path = get_db_path(app_handle);
    let conn = Connection::open(db_path)?;

    // 1. ESPECIES
    conn.execute(
        "CREATE TABLE IF NOT EXISTS especies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // 2. PRESENTACIONES
    conn.execute(
        "CREATE TABLE IF NOT EXISTS presentaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            especie_id INTEGER NOT NULL,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE RESTRICT,
            UNIQUE (especie_id, nombre)
        )",
        [],
    )?;

    // 3. FORMAS DE ENVASADO
    conn.execute(
        "CREATE TABLE IF NOT EXISTS formas_envasado (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // 4. FORMAS DE EMPACADO
    conn.execute(
        "CREATE TABLE IF NOT EXISTS formas_empacado (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // 5. CALIDADES
    conn.execute(
        "CREATE TABLE IF NOT EXISTS calidades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // 6. CALIBRES
    conn.execute(
        "CREATE TABLE IF NOT EXISTS calibres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            valor_minimo INTEGER,
            valor_maximo INTEGER
        )",
        [],
    )?;

    // 7. VARIANTES DE PRESENTACIONES
    conn.execute(
        "CREATE TABLE IF NOT EXISTS variantes_presentaciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            presentacion_id INTEGER NOT NULL,
            forma_envasado_id INTEGER,
            forma_empacado_id INTEGER,
            ensunchado INTEGER NOT NULL DEFAULT 0,
            calidad_id INTEGER,
            calibre_id INTEGER,
            observaciones TEXT,
            FOREIGN KEY (presentacion_id) REFERENCES presentaciones(id) ON DELETE RESTRICT,
            FOREIGN KEY (forma_envasado_id) REFERENCES formas_envasado(id) ON DELETE RESTRICT,
            FOREIGN KEY (forma_empacado_id) REFERENCES formas_empacado(id) ON DELETE RESTRICT,
            FOREIGN KEY (calidad_id) REFERENCES calidades(id) ON DELETE RESTRICT,
            FOREIGN KEY (calibre_id) REFERENCES calibres(id) ON DELETE RESTRICT,
            UNIQUE (presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id)
        )",
        [],
    )?;

    // 8. TIPOS DE INGRESO
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tipos_ingreso (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // Insertar tipos de ingreso por defecto
    conn.execute(
        "INSERT OR IGNORE INTO tipos_ingreso (codigo, descripcion) VALUES ('PRODUCCION', 'Ingreso por producción')",
        [],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO tipos_ingreso (codigo, descripcion) VALUES ('ORDEN_DESEMBARQUE', 'Ingreso por orden de desembarque')",
        [],
    )?;

    // 10. INGRESOS
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ingresos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            variante_id INTEGER NOT NULL,
            tipo_ingreso_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            peso_total_lote REAL,
            kg REAL NOT NULL,
            cajas INTEGER NOT NULL,
            observaciones TEXT,
            FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id) ON DELETE RESTRICT,
            FOREIGN KEY (tipo_ingreso_id) REFERENCES tipos_ingreso(id) ON DELETE RESTRICT
        )",
        [],
    )?;

    // 11. TIPOS DE SALIDA
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tipos_salida (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL UNIQUE,
            descripcion TEXT
        )",
        [],
    )?;

    // Insertar tipos de salida por defecto
    conn.execute(
        "INSERT OR IGNORE INTO tipos_salida (codigo, descripcion) VALUES ('MUESTREO', 'Salida por muestreo de calidad')",
        [],
    )?;
    conn.execute(
        "INSERT OR IGNORE INTO tipos_salida (codigo, descripcion) VALUES ('ORDEN_EMBARQUE', 'Salida por orden de embarque')",
        [],
    )?;

    // 12. SALIDAS
    conn.execute(
        "CREATE TABLE IF NOT EXISTS salidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            variante_id INTEGER NOT NULL,
            tipo_salida_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            kg REAL NOT NULL,
            cajas INTEGER NOT NULL,
            observaciones TEXT,
            FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id) ON DELETE RESTRICT,
            FOREIGN KEY (tipo_salida_id) REFERENCES tipos_salida(id) ON DELETE RESTRICT
        )",
        [],
    )?;

    // Inicializar tabla de usuarios (auth)
    auth::init_users_table(&conn)?;

    // ============ CREAR VISTA SQL PARA VARIANTES COMPLETAS ============
    // Esta vista centraliza toda la lógica de generación de códigos y JOINs
    conn.execute(
        "CREATE VIEW IF NOT EXISTS variantes_completas_view AS
        SELECT 
            v.id AS variante_id,
            e.id AS especie_id,
            e.nombre AS especie_nombre,
            p.id AS presentacion_id,
            p.nombre AS presentacion_nombre,
            fe.nombre AS forma_envasado,
            fem.nombre AS forma_empacado,
            v.ensunchado AS ensunchado,
            c.nombre AS calidad,
            CASE 
                WHEN cal.valor_minimo IS NOT NULL AND cal.valor_maximo IS NOT NULL 
                THEN CAST(cal.valor_minimo AS TEXT) || '-' || CAST(cal.valor_maximo AS TEXT)
                WHEN cal.valor_minimo IS NOT NULL 
                THEN CAST(cal.valor_minimo AS TEXT) || '+'
                WHEN cal.valor_maximo IS NOT NULL 
                THEN '0-' || CAST(cal.valor_maximo AS TEXT)
                ELSE NULL
            END AS calibre,
            (e.nombre || ' ' || p.nombre || 
             COALESCE(' ' || fe.nombre, '') || 
             COALESCE(' ' || fem.nombre, '') || 
             CASE WHEN v.ensunchado = 1 THEN ' Z' ELSE '' END || 
             COALESCE(' ' || c.nombre, '') || 
             COALESCE(' ' || 
                CASE 
                    WHEN cal.valor_minimo IS NOT NULL AND cal.valor_maximo IS NOT NULL 
                    THEN CAST(cal.valor_minimo AS TEXT) || '-' || CAST(cal.valor_maximo AS TEXT)
                    WHEN cal.valor_minimo IS NOT NULL 
                    THEN CAST(cal.valor_minimo AS TEXT) || '+'
                    WHEN cal.valor_maximo IS NOT NULL 
                    THEN '0-' || CAST(cal.valor_maximo AS TEXT)
                    ELSE NULL
                END, '')
            ) AS codigo_completo,
            CASE WHEN v.ensunchado = 1 THEN 'Z' ELSE NULL END AS tipo_ensunchado
        FROM variantes_presentaciones v
        JOIN presentaciones p ON v.presentacion_id = p.id
        JOIN especies e ON p.especie_id = e.id
        LEFT JOIN formas_envasado fe ON v.forma_envasado_id = fe.id
        LEFT JOIN formas_empacado fem ON v.forma_empacado_id = fem.id
        LEFT JOIN calidades c ON v.calidad_id = c.id
        LEFT JOIN calibres cal ON v.calibre_id = cal.id",
        [],
    )?;

    Ok(conn)
}
