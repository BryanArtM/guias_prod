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

const CREATE_TIPOS_DOCUMENTO_PRODUCCION: &str = "CREATE TABLE IF NOT EXISTS tipos_documento_produccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_TIPOS_DOCUMENTO_SALIDA: &str = "CREATE TABLE IF NOT EXISTS tipos_documento_salida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_MOTIVOS_SALIDA: &str = "CREATE TABLE IF NOT EXISTS motivos_salida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_CONTROLES_SALIDA: &str = "CREATE TABLE IF NOT EXISTS controles_salida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo_documento_id INTEGER NOT NULL,
    numero_control TEXT NOT NULL UNIQUE,
    fecha TEXT NOT NULL,
    cliente TEXT NOT NULL,
    fecha_produccion TEXT,
    turno TEXT,
    numero_lote TEXT,
    numero_camara TEXT,
    especie_id INTEGER NOT NULL,
    motivo_salida_id INTEGER NOT NULL,
    suma_cantidad INTEGER NOT NULL DEFAULT 0,
    suma_total_kg REAL NOT NULL DEFAULT 0,
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (especie_id) REFERENCES especies(id) ON DELETE RESTRICT,
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento_salida(id) ON DELETE RESTRICT,
    FOREIGN KEY (motivo_salida_id) REFERENCES motivos_salida(id) ON DELETE RESTRICT
)";

const CREATE_CONTROL_SALIDA_ITEMS: &str = "CREATE TABLE IF NOT EXISTS control_salida_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_salida_id INTEGER NOT NULL,
    numero_item INTEGER NOT NULL,
    variante_id INTEGER NOT NULL,
    codigo_trazabilidad TEXT,
    cantidad INTEGER NOT NULL,
    peso_unidad REAL NOT NULL,
    total_kg REAL NOT NULL,
    observaciones TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (control_salida_id) REFERENCES controles_salida(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id),
    UNIQUE (control_salida_id, numero_item)
)";

const CREATE_MOTIVOS_INGRESO: &str = "CREATE TABLE IF NOT EXISTS motivos_ingreso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    descripcion TEXT
)";

const CREATE_PARTES_PRODUCCION: &str = "CREATE TABLE IF NOT EXISTS partes_produccion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT,
    revision TEXT,
    version TEXT,
    cliente TEXT,
    fecha TEXT NOT NULL,
    turno TEXT,
    codigo_trazabilidad TEXT,
    especie_id INTEGER,
    motivo_ingreso_id INTEGER NOT NULL,
    entera REAL DEFAULT 0,
    observaciones TEXT,
    tipo_documento_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (especie_id) REFERENCES especies(id),
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento_produccion(id) ON DELETE RESTRICT
    FOREIGN KEY (motivo_ingreso_id) REFERENCES motivos_ingreso(id) ON DELETE RESTRICT
)";

const CREATE_PARTE_PRODUCCION_TRANSPORTE: &str = "CREATE TABLE IF NOT EXISTS parte_produccion_transporte (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parte_id INTEGER NOT NULL,
    num_guia TEXT,
    num_carro TEXT,
    placa TEXT,
    FOREIGN KEY (parte_id) REFERENCES partes_produccion(id) ON DELETE CASCADE
)";

const CREATE_PARTE_PRODUCCION_EMBARCACION: &str = "CREATE TABLE IF NOT EXISTS parte_produccion_embarcacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transporte_id INTEGER NOT NULL,
    nombre_embarcacion_pesquera TEXT,
    matricula_embarcacion_pesquera TEXT,
    peso_total_kg REAL,
    FOREIGN KEY (transporte_id) REFERENCES parte_produccion_transporte(id) ON DELETE CASCADE
)";

const CREATE_PARTE_PRODUCCION_PRODUCTO: &str = "CREATE TABLE IF NOT EXISTS parte_produccion_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parte_id INTEGER NOT NULL,
    variante_id INTEGER NOT NULL,
    peso_unidad REAL,
    cajas_carro_1 INTEGER DEFAULT 0,
    cajas_carro_2 INTEGER DEFAULT 0,
    cajas_carro_3 INTEGER DEFAULT 0,
    cajas_carro_4 INTEGER DEFAULT 0,
    peso_total_neto_kg REAL,
    acumulado_presentacion REAL,
    rendimiento REAL,
    FOREIGN KEY (parte_id) REFERENCES partes_produccion(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES variantes_presentaciones(id)
)";

const CREATE_PARTE_PRODUCCION_INSUMO: &str = "CREATE TABLE IF NOT EXISTS parte_produccion_insumo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parte_id INTEGER NOT NULL,
    nombre TEXT,
    cantidad INTEGER,
    FOREIGN KEY (parte_id) REFERENCES partes_produccion(id) ON DELETE CASCADE
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

const CREATE_STOCK_ACTUAL_VIEW: &str = "CREATE VIEW IF NOT EXISTS stock_actual_view AS
SELECT
    vc.variante_id,
    vc.codigo_completo,
    COALESCE(ing.kg, 0) - COALESCE(sal.kg, 0) AS stock_kg,
    COALESCE(ing.cajas, 0) - COALESCE(sal.cajas, 0) AS stock_cajas
FROM variantes_completas_view vc
LEFT JOIN (
    SELECT variante_id,
                 SUM(peso_total_neto_kg) AS kg,
                 SUM(cajas_carro_1 + cajas_carro_2 + cajas_carro_3 + cajas_carro_4) AS cajas
    FROM parte_produccion_producto
    GROUP BY variante_id
) ing ON ing.variante_id = vc.variante_id
LEFT JOIN (
    SELECT variante_id, SUM(total_kg) AS kg, SUM(cantidad) AS cajas
    FROM control_salida_items
    GROUP BY variante_id
) sal ON sal.variante_id = vc.variante_id";

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
    
    // Tipos de documento para partes de producción
    conn.execute(CREATE_TIPOS_DOCUMENTO_PRODUCCION, ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_produccion (codigo, descripcion) VALUES ('PRODUCCION', 'Documento de producción')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_produccion (codigo, descripcion) VALUES ('DESEMBARQUE', 'Documento de desembarque')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_produccion (codigo, descripcion) VALUES ('DIRIMENCIA', 'Documento por dirimencia')", ()).await?;
    
        // Motivos de ingreso
    conn.execute(CREATE_MOTIVOS_INGRESO, ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_ingreso (codigo, descripcion) VALUES ('PRODUCCION', 'Produccion')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_ingreso (codigo, descripcion) VALUES ('REEMPAQUE', 'Reempaque')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_ingreso (codigo, descripcion) VALUES ('DESPACHO', 'Despacho')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_ingreso (codigo, descripcion) VALUES ('OTROS', 'Otros')", ()).await?;

    // Tipos de documento para controles de salida
    conn.execute(CREATE_TIPOS_DOCUMENTO_SALIDA, ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_salida (codigo, descripcion) VALUES ('SALIDA', 'Documento de salida')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_salida (codigo, descripcion) VALUES ('MUESTREO', 'Documento por muestreo')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO tipos_documento_salida (codigo, descripcion) VALUES ('EMBARQUE', 'Documento por embarque')", ()).await?;

    
    conn.execute(CREATE_CONTROLES_SALIDA, ()).await?;
    conn.execute(CREATE_CONTROL_SALIDA_ITEMS, ()).await?;
    
    // Motivos de salida
    conn.execute(CREATE_MOTIVOS_SALIDA, ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_salida (codigo, descripcion) VALUES ('ALMACENAJE', 'Almacenaje')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_salida (codigo, descripcion) VALUES ('REEMPAQUE', 'Reempaque')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_salida (codigo, descripcion) VALUES ('DESPACHO', 'Despacho')", ()).await?;
    conn.execute("INSERT OR IGNORE INTO motivos_salida (codigo, descripcion) VALUES ('OTROS', 'Otros')", ()).await?;
    
    conn.execute(CREATE_PARTES_PRODUCCION, ()).await?;
    conn.execute(CREATE_PARTE_PRODUCCION_TRANSPORTE, ()).await?;
    conn.execute(CREATE_PARTE_PRODUCCION_EMBARCACION, ()).await?;
    conn.execute(CREATE_PARTE_PRODUCCION_PRODUCTO, ()).await?;
    conn.execute(CREATE_PARTE_PRODUCCION_INSUMO, ()).await?;
    
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
    conn.execute(CREATE_STOCK_ACTUAL_VIEW, ()).await?;
    Ok(())
}

async fn create_indexes(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    println!("Creando índices de optimización...");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_fecha ON controles_salida(fecha DESC)", ()).await?;
    println!(" Índice idx_controles_salida_fecha");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_especie_id ON controles_salida(especie_id)", ()).await?;
    println!(" Índice idx_controles_salida_especie_id");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_control_salida_items_control_id ON control_salida_items(control_salida_id)", ()).await?;
    println!(" Índice idx_control_salida_items_control_id");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_presentaciones_especie_id ON presentaciones(especie_id)", ()).await?;
    println!(" Índice idx_presentaciones_especie_id");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_producto_parte_id ON parte_produccion_producto(parte_id)", ()).await?;
    println!(" Índice idx_parte_produccion_producto_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_producto_variante_id ON parte_produccion_producto(variante_id)", ()).await?;
    println!(" Índice idx_parte_produccion_producto_variante_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_transporte_parte_id ON parte_produccion_transporte(parte_id)", ()).await?;
    println!(" Índice idx_parte_produccion_transporte_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_embarcacion_transporte_id ON parte_produccion_embarcacion(transporte_id)", ()).await?;
    println!(" Índice idx_parte_produccion_embarcacion_transporte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_insumo_parte_id ON parte_produccion_insumo(parte_id)", ()).await?;
    println!(" Índice idx_parte_produccion_insumo_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_partes_produccion_especie_id ON partes_produccion(especie_id)", ()).await?;
    println!(" Índice idx_partes_produccion_especie_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_partes_produccion_tipo_documento_id ON partes_produccion(tipo_documento_id)", ()).await?;
    println!(" Índice idx_partes_produccion_tipo_documento_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_control_salida_items_variante_id ON control_salida_items(variante_id)", ()).await?;
    println!(" Índice idx_control_salida_items_variante_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_motivo_salida_id ON controles_salida(motivo_salida_id)", ()).await?;
    println!(" Índice idx_controles_salida_motivo_salida_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_tipo_documento_id ON controles_salida(tipo_documento_id)", ()).await?;
    println!(" Índice idx_controles_salida_tipo_documento_id");
    
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
    create_indexes(&conn).await?;

    println!("Tablas, vistas e índices creados/verificados correctamente");

    Ok(db)
}
