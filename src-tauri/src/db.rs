use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::AppHandle;
use std::path::PathBuf;
use tauri::Manager;
use crate::auth;

// ============ ESTRUCTURAS DE DATOS ============

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
    pub numero_lote: Option<String>,
    pub numero_orden_desembarque: Option<String>,
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
    pub numero_orden: Option<String>,
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

// ============ INICIALIZACIÓN DE BASE DE DATOS ============
pub fn get_db_path(app_handle: &AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("No se pudo obtener el directorio de datos de la app");
    
    std::fs::create_dir_all(&app_dir).expect("No se pudo crear el directorio");
    
    let db_path = app_dir.join("inventario_produccion.db");
    
    db_path
}

// ============ INICIALIZACIÓN DE TABLAS ============
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
            numero_lote TEXT,
            numero_orden_desembarque TEXT,
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
            numero_orden TEXT,
            observaciones TEXT,
            FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id) ON DELETE RESTRICT,
            FOREIGN KEY (tipo_salida_id) REFERENCES tipos_salida(id) ON DELETE RESTRICT
        )",
        [],
    )?;

    // Inicializar tabla de usuarios (auth)
    auth::init_users_table(&conn)?;

    Ok(conn)
}

// ============ CRUD ESPECIES ============

pub fn crear_especie(conn: &Connection, especie: &Especie) -> Result<i64> {
    conn.execute(
        "INSERT INTO especies (nombre, descripcion) VALUES (?1, ?2)",
        (&especie.nombre, &especie.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_especies(conn: &Connection) -> Result<Vec<Especie>> {
    let mut stmt = conn.prepare("SELECT id, nombre, descripcion FROM especies ORDER BY nombre")?;
    let especies_iter = stmt.query_map([], |row| {
        Ok(Especie {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut especies = Vec::new();
    for especie in especies_iter {
        especies.push(especie?);
    }
    Ok(especies)
}

pub fn obtener_especie(conn: &Connection, id: i64) -> Result<Especie> {
    conn.query_row(
        "SELECT id, nombre, descripcion FROM especies WHERE id = ?1",
        [id],
        |row| {
            Ok(Especie {
                id: Some(row.get(0)?),
                nombre: row.get(1)?,
                descripcion: row.get(2)?,
            })
        },
    )
}

pub fn actualizar_especie(conn: &Connection, id: i64, especie: &Especie) -> Result<()> {
    conn.execute(
        "UPDATE especies SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&especie.nombre, &especie.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_especie(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM especies WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD PRESENTACIONES ============

pub fn crear_presentacion(conn: &Connection, presentacion: &Presentacion) -> Result<i64> {
    conn.execute(
        "INSERT INTO presentaciones (especie_id, nombre, descripcion) VALUES (?1, ?2, ?3)",
        (
            &presentacion.especie_id,
            &presentacion.nombre,
            &presentacion.descripcion,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_presentaciones(conn: &Connection) -> Result<Vec<Presentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones ORDER BY nombre",
    )?;
    let presentaciones_iter = stmt.query_map([], |row| {
        Ok(Presentacion {
            id: Some(row.get(0)?),
            especie_id: row.get(1)?,
            nombre: row.get(2)?,
            descripcion: row.get(3)?,
        })
    })?;

    let mut presentaciones = Vec::new();
    for presentacion in presentaciones_iter {
        presentaciones.push(presentacion?);
    }
    Ok(presentaciones)
}

pub fn obtener_presentaciones_por_especie(
    conn: &Connection,
    especie_id: i64,
) -> Result<Vec<Presentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, especie_id, nombre, descripcion FROM presentaciones WHERE especie_id = ?1 ORDER BY nombre",
    )?;
    let presentaciones_iter = stmt.query_map([especie_id], |row| {
        Ok(Presentacion {
            id: Some(row.get(0)?),
            especie_id: row.get(1)?,
            nombre: row.get(2)?,
            descripcion: row.get(3)?,
        })
    })?;

    let mut presentaciones = Vec::new();
    for presentacion in presentaciones_iter {
        presentaciones.push(presentacion?);
    }
    Ok(presentaciones)
}

pub fn actualizar_presentacion(
    conn: &Connection,
    id: i64,
    presentacion: &Presentacion,
) -> Result<()> {
    conn.execute(
        "UPDATE presentaciones SET especie_id = ?1, nombre = ?2, descripcion = ?3 WHERE id = ?4",
        (
            &presentacion.especie_id,
            &presentacion.nombre,
            &presentacion.descripcion,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_presentacion(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM presentaciones WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD FORMAS DE ENVASADO ============

pub fn crear_forma_envasado(conn: &Connection, forma: &FormaEnvasado) -> Result<i64> {
    conn.execute(
        "INSERT INTO formas_envasado (nombre, descripcion) VALUES (?1, ?2)",
        (&forma.nombre, &forma.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_formas_envasado(conn: &Connection) -> Result<Vec<FormaEnvasado>> {
    let mut stmt =
        conn.prepare("SELECT id, nombre, descripcion FROM formas_envasado ORDER BY nombre")?;
    let formas_iter = stmt.query_map([], |row| {
        Ok(FormaEnvasado {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut formas = Vec::new();
    for forma in formas_iter {
        formas.push(forma?);
    }
    Ok(formas)
}

pub fn actualizar_forma_envasado(conn: &Connection, id: i64, forma: &FormaEnvasado) -> Result<()> {
    conn.execute(
        "UPDATE formas_envasado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&forma.nombre, &forma.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_forma_envasado(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM formas_envasado WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD FORMAS DE EMPACADO ============

pub fn crear_forma_empacado(conn: &Connection, forma: &FormaEmpacado) -> Result<i64> {
    conn.execute(
        "INSERT INTO formas_empacado (nombre, descripcion) VALUES (?1, ?2)",
        (&forma.nombre, &forma.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_formas_empacado(conn: &Connection) -> Result<Vec<FormaEmpacado>> {
    let mut stmt =
        conn.prepare("SELECT id, nombre, descripcion FROM formas_empacado ORDER BY nombre")?;
    let formas_iter = stmt.query_map([], |row| {
        Ok(FormaEmpacado {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut formas = Vec::new();
    for forma in formas_iter {
        formas.push(forma?);
    }
    Ok(formas)
}

pub fn actualizar_forma_empacado(conn: &Connection, id: i64, forma: &FormaEmpacado) -> Result<()> {
    conn.execute(
        "UPDATE formas_empacado SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&forma.nombre, &forma.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_forma_empacado(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM formas_empacado WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD CALIDADES ============

pub fn crear_calidad(conn: &Connection, calidad: &Calidad) -> Result<i64> {
    conn.execute(
        "INSERT INTO calidades (nombre, descripcion) VALUES (?1, ?2)",
        (&calidad.nombre, &calidad.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_calidades(conn: &Connection) -> Result<Vec<Calidad>> {
    let mut stmt = conn.prepare("SELECT id, nombre, descripcion FROM calidades ORDER BY nombre")?;
    let calidades_iter = stmt.query_map([], |row| {
        Ok(Calidad {
            id: Some(row.get(0)?),
            nombre: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut calidades = Vec::new();
    for calidad in calidades_iter {
        calidades.push(calidad?);
    }
    Ok(calidades)
}

pub fn actualizar_calidad(conn: &Connection, id: i64, calidad: &Calidad) -> Result<()> {
    conn.execute(
        "UPDATE calidades SET nombre = ?1, descripcion = ?2 WHERE id = ?3",
        (&calidad.nombre, &calidad.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_calidad(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM calidades WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD CALIBRES ============

pub fn crear_calibre(conn: &Connection, calibre: &Calibre) -> Result<i64> {
    conn.execute(
        "INSERT INTO calibres (valor_minimo, valor_maximo) VALUES (?1, ?2)",
        (&calibre.valor_minimo, &calibre.valor_maximo),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_calibres(conn: &Connection) -> Result<Vec<Calibre>> {
    let mut stmt = conn.prepare(
        "SELECT id, valor_minimo, valor_maximo FROM calibres ORDER BY valor_minimo, valor_maximo",
    )?;
    let calibres_iter = stmt.query_map([], |row| {
        Ok(Calibre {
            id: Some(row.get(0)?),
            valor_minimo: row.get(1)?,
            valor_maximo: row.get(2)?,
        })
    })?;

    let mut calibres = Vec::new();
    for calibre in calibres_iter {
        calibres.push(calibre?);
    }
    Ok(calibres)
}

pub fn actualizar_calibre(conn: &Connection, id: i64, calibre: &Calibre) -> Result<()> {
    conn.execute(
        "UPDATE calibres SET valor_minimo = ?1, valor_maximo = ?2 WHERE id = ?3",
        (
            &calibre.valor_minimo,
            &calibre.valor_maximo,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_calibre(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM calibres WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD VARIANTES DE PRESENTACIONES ============

pub fn crear_variante_presentacion(
    conn: &Connection,
    variante: &VariantePresentacion,
) -> Result<i64> {
    conn.execute(
        "INSERT INTO variantes_presentaciones 
         (presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &variante.presentacion_id,
            &variante.forma_envasado_id,
            &variante.forma_empacado_id,
            if variante.ensunchado { 1 } else { 0 },
            &variante.calidad_id,
            &variante.calibre_id,
            &variante.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_variantes_presentaciones(conn: &Connection) -> Result<Vec<VariantePresentacion>> {
    let mut stmt = conn.prepare(
        "SELECT id, presentacion_id, forma_envasado_id, forma_empacado_id, ensunchado, calidad_id, calibre_id, observaciones 
         FROM variantes_presentaciones ORDER BY id DESC",
    )?;
    let variantes_iter = stmt.query_map([], |row| {
        let ensunchado_int: i64 = row.get(4)?;
        Ok(VariantePresentacion {
            id: Some(row.get(0)?),
            presentacion_id: row.get(1)?,
            forma_envasado_id: row.get(2)?,
            forma_empacado_id: row.get(3)?,
            ensunchado: ensunchado_int != 0,
            calidad_id: row.get(5)?,
            calibre_id: row.get(6)?,
            observaciones: row.get(7)?,
        })
    })?;

    let mut variantes = Vec::new();
    for variante in variantes_iter {
        variantes.push(variante?);
    }
    Ok(variantes)
}

pub fn obtener_variantes_completas(conn: &Connection) -> Result<Vec<VarianteCompleta>> {
    let mut stmt = conn.prepare(
        "SELECT 
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
            END AS calibre
         FROM variantes_presentaciones v
         JOIN presentaciones p ON v.presentacion_id = p.id
         JOIN especies e ON p.especie_id = e.id
         LEFT JOIN formas_envasado fe ON v.forma_envasado_id = fe.id
         LEFT JOIN formas_empacado fem ON v.forma_empacado_id = fem.id
         LEFT JOIN calidades c ON v.calidad_id = c.id
         LEFT JOIN calibres cal ON v.calibre_id = cal.id
         ORDER BY e.nombre, p.nombre",
    )?;
    let variantes_iter = stmt.query_map([], |row| {
        let especie_nombre: String = row.get(2)?;
        let presentacion_nombre: String = row.get(4)?;
        let forma_envasado: Option<String> = row.get(5)?;
        let forma_empacado: Option<String> = row.get(6)?;
        let ensunchado_int: i64 = row.get(7)?;
        let ensunchado = ensunchado_int != 0;
        let calidad: Option<String> = row.get(8)?;
        let calibre: Option<String> = row.get(9)?;

        let mut codigo_parts = vec![especie_nombre.clone(), presentacion_nombre.clone()];
        if let Some(fe) = &forma_envasado {
            codigo_parts.push(fe.clone());
        }
        if let Some(fem) = &forma_empacado {
            codigo_parts.push(fem.clone());
        }
        if ensunchado {
            codigo_parts.push("Z".to_string());
        }
        if let Some(c) = &calidad {
            codigo_parts.push(c.clone());
        }
        if let Some(cal) = &calibre {
            codigo_parts.push(cal.clone());
        }
        let codigo_completo = codigo_parts.join(" ");

        Ok(VarianteCompleta {
            variante_id: row.get(0)?,
            especie_id: row.get(1)?,
            especie_nombre,
            presentacion_id: row.get(3)?,
            presentacion_nombre,
            forma_envasado,
            forma_empacado,
            tipo_ensunchado: if ensunchado { Some("Z".to_string()) } else { None },
            calidad,
            calibre,
            codigo_completo,
        })
    })?;

    let mut variantes = Vec::new();
    for variante in variantes_iter {
        variantes.push(variante?);
    }
    Ok(variantes)
}

pub fn actualizar_variante_presentacion(
    conn: &Connection,
    id: i64,
    variante: &VariantePresentacion,
) -> Result<()> {
    conn.execute(
        "UPDATE variantes_presentaciones 
         SET presentacion_id = ?1, forma_envasado_id = ?2, forma_empacado_id = ?3, 
             ensunchado = ?4, calidad_id = ?5, calibre_id = ?6, observaciones = ?7
         WHERE id = ?8",
        (
            &variante.presentacion_id,
            &variante.forma_envasado_id,
            &variante.forma_empacado_id,
            if variante.ensunchado { 1 } else { 0 },
            &variante.calidad_id,
            &variante.calibre_id,
            &variante.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_variante_presentacion(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM variantes_presentaciones WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD TIPOS DE INGRESO ============

pub fn obtener_tipos_ingreso(conn: &Connection) -> Result<Vec<TipoIngreso>> {
    let mut stmt =
        conn.prepare("SELECT id, codigo, descripcion FROM tipos_ingreso ORDER BY codigo")?;
    let tipos_iter = stmt.query_map([], |row| {
        Ok(TipoIngreso {
            id: Some(row.get(0)?),
            codigo: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut tipos = Vec::new();
    for tipo in tipos_iter {
        tipos.push(tipo?);
    }
    Ok(tipos)
}

// ============ CRUD INGRESOS ============

pub fn crear_ingreso(conn: &Connection, ingreso: &Ingreso) -> Result<i64> {
    conn.execute(
        "INSERT INTO ingresos 
         (variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, numero_lote, numero_orden_desembarque, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        (
            &ingreso.variante_id,
            &ingreso.tipo_ingreso_id,
            &ingreso.fecha,
            &ingreso.peso_total_lote,
            &ingreso.kg,
            &ingreso.cajas,
            &ingreso.numero_lote,
            &ingreso.numero_orden_desembarque,
            &ingreso.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_ingresos(conn: &Connection) -> Result<Vec<Ingreso>> {
    let mut stmt = conn.prepare(
        "SELECT id, variante_id, tipo_ingreso_id, fecha, peso_total_lote, kg, cajas, 
                numero_lote, numero_orden_desembarque, observaciones
         FROM ingresos 
         ORDER BY fecha DESC, id DESC",
    )?;
    let ingresos_iter = stmt.query_map([], |row| {
        Ok(Ingreso {
            id: Some(row.get(0)?),
            variante_id: row.get(1)?,
            tipo_ingreso_id: row.get(2)?,
            fecha: row.get(3)?,
            peso_total_lote: row.get(4)?,
            kg: row.get(5)?,
            cajas: row.get(6)?,
            numero_lote: row.get(7)?,
            numero_orden_desembarque: row.get(8)?,
            observaciones: row.get(9)?,
        })
    })?;

    let mut ingresos = Vec::new();
    for ingreso in ingresos_iter {
        ingresos.push(ingreso?);
    }
    Ok(ingresos)
}

pub fn actualizar_ingreso(conn: &Connection, id: i64, ingreso: &Ingreso) -> Result<()> {
    conn.execute(
        "UPDATE ingresos 
         SET variante_id = ?1, tipo_ingreso_id = ?2, fecha = ?3, peso_total_lote = ?4, 
             kg = ?5, cajas = ?6, numero_lote = ?7, numero_orden_desembarque = ?8, observaciones = ?9
         WHERE id = ?10",
        (
            &ingreso.variante_id,
            &ingreso.tipo_ingreso_id,
            &ingreso.fecha,
            &ingreso.peso_total_lote,
            &ingreso.kg,
            &ingreso.cajas,
            &ingreso.numero_lote,
            &ingreso.numero_orden_desembarque,
            &ingreso.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_ingreso(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM ingresos WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CRUD TIPOS DE SALIDA ============

pub fn obtener_tipos_salida(conn: &Connection) -> Result<Vec<TipoSalida>> {
    let mut stmt =
        conn.prepare("SELECT id, codigo, descripcion FROM tipos_salida ORDER BY codigo")?;
    let tipos_iter = stmt.query_map([], |row| {
        Ok(TipoSalida {
            id: Some(row.get(0)?),
            codigo: row.get(1)?,
            descripcion: row.get(2)?,
        })
    })?;

    let mut tipos = Vec::new();
    for tipo in tipos_iter {
        tipos.push(tipo?);
    }
    Ok(tipos)
}

// ============ CRUD SALIDAS ============

pub fn crear_salida(conn: &Connection, salida: &Salida) -> Result<i64> {
    conn.execute(
        "INSERT INTO salidas 
         (variante_id, tipo_salida_id, fecha, kg, cajas, numero_orden, observaciones)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            &salida.variante_id,
            &salida.tipo_salida_id,
            &salida.fecha,
            &salida.kg,
            &salida.cajas,
            &salida.numero_orden,
            &salida.observaciones,
        ),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_salidas(conn: &Connection) -> Result<Vec<Salida>> {
    let mut stmt = conn.prepare(
        "SELECT id, variante_id, tipo_salida_id, fecha, kg, cajas, numero_orden, observaciones
         FROM salidas 
         ORDER BY fecha DESC, id DESC",
    )?;
    let salidas_iter = stmt.query_map([], |row| {
        Ok(Salida {
            id: Some(row.get(0)?),
            variante_id: row.get(1)?,
            tipo_salida_id: row.get(2)?,
            fecha: row.get(3)?,
            kg: row.get(4)?,
            cajas: row.get(5)?,
            numero_orden: row.get(6)?,
            observaciones: row.get(7)?,
        })
    })?;

    let mut salidas = Vec::new();
    for salida in salidas_iter {
        salidas.push(salida?);
    }
    Ok(salidas)
}

pub fn actualizar_salida(conn: &Connection, id: i64, salida: &Salida) -> Result<()> {
    conn.execute(
        "UPDATE salidas 
         SET variante_id = ?1, tipo_salida_id = ?2, fecha = ?3, kg = ?4, cajas = ?5, 
             numero_orden = ?6, observaciones = ?7
         WHERE id = ?8",
        (
            &salida.variante_id,
            &salida.tipo_salida_id,
            &salida.fecha,
            &salida.kg,
            &salida.cajas,
            &salida.numero_orden,
            &salida.observaciones,
            id,
        ),
    )?;
    Ok(())
}

pub fn eliminar_salida(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM salidas WHERE id = ?1", [id])?;
    Ok(())
}

// ============ CONSULTAS DE STOCK ============

pub fn obtener_stock_por_variante(conn: &Connection) -> Result<Vec<StockVariante>> {
    let mut stmt = conn.prepare(
        "SELECT 
            v.id AS variante_id,
            (e.nombre || ' ' || p.nombre || 
             COALESCE(' ' || fe.nombre, '') || 
             COALESCE(' ' || fem.nombre, '') || 
             CASE WHEN v.ensunchado = 1 THEN ' Z' ELSE '' END || 
             COALESCE(' ' || c.nombre, '') || 
             CASE 
                WHEN cal.valor_minimo IS NOT NULL AND cal.valor_maximo IS NOT NULL 
                THEN ' ' || cal.valor_minimo || '-' || cal.valor_maximo
                WHEN cal.valor_minimo IS NOT NULL 
                THEN ' ' || cal.valor_minimo || '+'
                WHEN cal.valor_maximo IS NOT NULL 
                THEN ' -' || cal.valor_maximo
                ELSE ''
             END) AS codigo_completo,
            e.nombre AS especie_nombre,
            p.nombre AS presentacion_nombre,
            COALESCE(SUM(i.kg), 0) AS kg_ingresados,
            COALESCE(SUM(s.kg), 0) AS kg_salidos,
            COALESCE(SUM(i.kg), 0) - COALESCE(SUM(s.kg), 0) AS kg_stock,
            COALESCE(SUM(i.cajas), 0) AS cajas_ingresadas,
            COALESCE(SUM(s.cajas), 0) AS cajas_salidas,
            COALESCE(SUM(i.cajas), 0) - COALESCE(SUM(s.cajas), 0) AS cajas_stock
         FROM variantes_presentaciones v
         JOIN presentaciones p ON v.presentacion_id = p.id
         JOIN especies e ON p.especie_id = e.id
         LEFT JOIN formas_envasado fe ON v.forma_envasado_id = fe.id
         LEFT JOIN formas_empacado fem ON v.forma_empacado_id = fem.id
         LEFT JOIN calidades c ON v.calidad_id = c.id
         LEFT JOIN calibres cal ON v.calibre_id = cal.id
         LEFT JOIN ingresos i ON v.id = i.variante_id
         LEFT JOIN salidas s ON v.id = s.variante_id
         GROUP BY v.id, e.nombre, p.nombre, fe.nombre, fem.nombre, v.ensunchado, c.nombre, cal.valor_minimo, cal.valor_maximo
         ORDER BY e.nombre, p.nombre",
    )?;

    let stock_iter = stmt.query_map([], |row| {
        Ok(StockVariante {
            variante_id: row.get(0)?,
            codigo_completo: row.get(1)?,
            especie_nombre: row.get(2)?,
            presentacion_nombre: row.get(3)?,
            kg_ingresados: row.get(4)?,
            kg_salidos: row.get(5)?,
            kg_stock: row.get(6)?,
            cajas_ingresadas: row.get(7)?,
            cajas_salidas: row.get(8)?,
            cajas_stock: row.get(9)?,
        })
    })?;

    let mut stocks = Vec::new();
    for stock in stock_iter {
        stocks.push(stock?);
    }
    Ok(stocks)
}
