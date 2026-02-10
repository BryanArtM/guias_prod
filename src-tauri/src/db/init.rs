use libsql::{Database, Connection};
use std::env;
use dotenvy::dotenv;

const CREATE_ESPECIES: &str = "CREATE TABLE IF NOT EXISTS especies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_PRESENTACIONES: &str = "CREATE TABLE IF NOT EXISTS presentaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    especie_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE RESTRICT,
    UNIQUE (especie_id, nombre)
)";

const CREATE_FORMAS_ENVASADO: &str = "CREATE TABLE IF NOT EXISTS formas_envasado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_FORMAS_EMPACADO: &str = "CREATE TABLE IF NOT EXISTS formas_empacado (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_CALIDADES: &str = "CREATE TABLE IF NOT EXISTS calidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_CALIBRES: &str = "CREATE TABLE IF NOT EXISTS calibres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valor_minimo INTEGER,
    valor_maximo INTEGER
)";

const CREATE_VARIANTES: &str = "CREATE TABLE IF NOT EXISTS variantes_presentaciones (
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
)";

const CREATE_TIPOS_INGRESO: &str = "CREATE TABLE IF NOT EXISTS tipos_ingreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_INGRESOS: &str = "CREATE TABLE IF NOT EXISTS ingresos (
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
)";

const CREATE_TIPOS_SALIDA: &str = "CREATE TABLE IF NOT EXISTS tipos_salida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_SALIDAS: &str = "CREATE TABLE IF NOT EXISTS salidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    variante_id INTEGER NOT NULL,
    tipo_salida_id INTEGER NOT NULL,
    fecha TEXT NOT NULL,
    kg REAL NOT NULL,
    cajas INTEGER NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_salida_id) REFERENCES tipos_salida(id) ON DELETE RESTRICT
)";

const CREATE_USERS: &str = "CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
)";

const CREATE_VIEW: &str = "CREATE VIEW IF NOT EXISTS variantes_completas_view AS
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
LEFT JOIN calibres cal ON v.calibre_id = cal.id";

async fn create_tables(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creando tablas...");
    
    conn.execute(CREATE_ESPECIES, ()).await?;
    println!("  ✓ Tabla especies");
    conn.execute(CREATE_PRESENTACIONES, ()).await?;
    println!("  ✓ Tabla presentaciones");
    conn.execute(CREATE_FORMAS_ENVASADO, ()).await?;
    println!("  ✓ Tabla formas_envasado");
    conn.execute(CREATE_FORMAS_EMPACADO, ()).await?;
    println!("  ✓ Tabla formas_empacado");
    conn.execute(CREATE_CALIDADES, ()).await?;
    println!("  ✓ Tabla calidades");
    conn.execute(CREATE_CALIBRES, ()).await?;
    println!("  ✓ Tabla calibres");
    conn.execute(CREATE_VARIANTES, ()).await?;
    println!("  ✓ Tabla variantes");
    
    Ok(())
}

async fn create_transaction_tables(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creando tablas de transacciones...");
    
    conn.execute(CREATE_TIPOS_INGRESO, ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_ingreso (codigo, descripcion) VALUES ('PRODUCCION', 'Ingreso por producción')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_ingreso (codigo, descripcion) VALUES ('ORDEN_DESEMBARQUE', 'Ingreso por orden de desembarque')", ()).await?;
    
    conn.execute(CREATE_INGRESOS, ()).await?;
    
    conn.execute(CREATE_TIPOS_SALIDA, ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_salida (codigo, descripcion) VALUES ('MUESTREO', 'Salida por muestreo de calidad')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_salida (codigo, descripcion) VALUES ('ORDEN_EMBARQUE', 'Salida por orden de embarque')", ()).await?;
    
    conn.execute(CREATE_SALIDAS, ()).await?;
    
    Ok(())
}

async fn create_users_table(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creando tabla de usuarios...");
    conn.execute(CREATE_USERS, ()).await?;
    Ok(())
}

async fn create_views(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creando vistas...");
    conn.execute(CREATE_VIEW, ()).await?;
    Ok(())
}

pub async fn init_db() -> Result<Database, Box<dyn std::error::Error>> {
    dotenv().ok();
    
    let database_url = env::var("TURSO_DATABASE_URL")
        .expect("TURSO_DATABASE_URL debe estar configurada en el archivo .env");
    let auth_token = env::var("TURSO_AUTH_TOKEN")
        .expect("TURSO_AUTH_TOKEN debe estar configurada en el archivo .env");

    println!("Conectando a Turso en: {}", database_url);

    let db = libsql::Builder::new_remote(database_url, auth_token)
        .build()
        .await?;
    
    println!("Conexión establecida con Turso");

    let conn = db.connect()?;

    create_tables(&conn).await?;
    create_transaction_tables(&conn).await?;
    create_users_table(&conn).await?;
    create_views(&conn).await?;

    println!("Tablas y vistas creadas/verificadas correctamente");

    Ok(db)
}
