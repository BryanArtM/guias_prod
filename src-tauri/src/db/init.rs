use libsql::{Database, Connection};
use std::env;
use dotenvy::dotenv;

const CREATE_ESPECIES: &str = "CREATE TABLE IF NOT EXISTS especies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    peso_unidad_defecto REAL
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
    ensunchado INTEGER NOT NULL DEFAULT 0,
    calidad_id INTEGER,
    calibre_id INTEGER,
    FOREIGN KEY (presentacion_id) REFERENCES presentaciones(id) ON DELETE RESTRICT,
    FOREIGN KEY (calidad_id) REFERENCES calidades(id) ON DELETE RESTRICT,
    FOREIGN KEY (calibre_id) REFERENCES calibres(id) ON DELETE RESTRICT,
    UNIQUE (presentacion_id, ensunchado, calidad_id, calibre_id)
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
    fecha TEXT NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    cliente TEXT NOT NULL,
    fecha_produccion TEXT CHECK (fecha_produccion IS NULL OR fecha_produccion GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
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

// fecha_ingreso identifica el lote del que sale la mercaderia: una misma variante
// puede tener existencias de varias fechas de ingreso, y el stock se lleva por lote.
const CREATE_CONTROL_SALIDA_ITEMS: &str = "CREATE TABLE IF NOT EXISTS control_salida_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    control_salida_id INTEGER NOT NULL,
    numero_item INTEGER NOT NULL,
    variante_id INTEGER NOT NULL,
    fecha_ingreso TEXT CHECK (fecha_ingreso IS NULL OR fecha_ingreso GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
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
    fecha TEXT NOT NULL CHECK (fecha GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
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

// fecha_ingreso se copia de la cabecera del parte al guardar en vez de derivarse
// con un JOIN: asi cada fila es un lote autocontenido y el stock historico no
// cambia solo porque se edite la cabecera del documento.
const CREATE_PARTE_PRODUCCION_PRODUCTO: &str = "CREATE TABLE IF NOT EXISTS parte_produccion_producto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parte_id INTEGER NOT NULL,
    variante_id INTEGER NOT NULL,
    fecha_ingreso TEXT CHECK (fecha_ingreso IS NULL OR fecha_ingreso GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
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
    v.ensunchado AS ensunchado,
    v.calidad_id AS calidad_id,
    v.calibre_id AS calibre_id,
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
LEFT JOIN calidades c ON v.calidad_id = c.id
LEFT JOIN calibres cal ON v.calibre_id = cal.id";

const CREATE_STOCK_ACTUAL_VIEW: &str = "CREATE VIEW IF NOT EXISTS stock_actual_view AS
SELECT
    vc.variante_id,
    vc.codigo_completo,
    vc.especie_nombre,
    vc.presentacion_nombre,
    -- Los CAST son obligatorios: las expresiones calculadas no tienen afinidad de
    -- tipo, así que COALESCE(NULL, 0) devolvería INTEGER para las variantes sin
    -- movimientos y el driver entra en pánico al leer un INTEGER como f64.
    CAST(COALESCE(ing.kg, 0) AS REAL) AS ingresos_kg,
    CAST(COALESCE(sal.kg, 0) AS REAL) AS salidas_kg,
    CAST(COALESCE(ing.cajas, 0) AS INTEGER) AS ingresos_cajas,
    CAST(COALESCE(sal.cajas, 0) AS INTEGER) AS salidas_cajas,
    CAST(COALESCE(ing.kg, 0) - COALESCE(sal.kg, 0) AS REAL) AS stock_kg,
    CAST(COALESCE(ing.cajas, 0) - COALESCE(sal.cajas, 0) AS INTEGER) AS stock_cajas
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

// Stock desglosado por lote: cada combinacion de variante y fecha de ingreso es
// una existencia independiente, porque la fecha del parte de produccion se hereda
// a lo que se almacena. Las salidas descuentan del lote que declaran consumir.
const CREATE_STOCK_POR_LOTE_VIEW: &str = "CREATE VIEW IF NOT EXISTS stock_por_lote_view AS
SELECT
    ing.variante_id,
    ing.fecha_ingreso,
    vc.codigo_completo,
    vc.especie_id,
    vc.especie_nombre,
    vc.presentacion_id,
    vc.presentacion_nombre,
    vc.calidad_id,
    vc.calibre_id,
    vc.calidad,
    vc.calibre,
    vc.tipo_ensunchado,
    CAST(COALESCE(ing.peso_unidad, 0) AS REAL) AS peso_unidad,
    CAST(COALESCE(ing.kg, 0) AS REAL) AS ingresos_kg,
    CAST(COALESCE(sal.kg, 0) AS REAL) AS salidas_kg,
    CAST(COALESCE(ing.cajas, 0) AS INTEGER) AS ingresos_cajas,
    CAST(COALESCE(sal.cajas, 0) AS INTEGER) AS salidas_cajas,
    CAST(COALESCE(ing.kg, 0) - COALESCE(sal.kg, 0) AS REAL) AS stock_kg,
    CAST(COALESCE(ing.cajas, 0) - COALESCE(sal.cajas, 0) AS INTEGER) AS stock_cajas
FROM (
    SELECT pp.variante_id,
           pp.fecha_ingreso,
           SUM(pp.peso_total_neto_kg) AS kg,
           SUM(pp.cajas_carro_1 + pp.cajas_carro_2 + pp.cajas_carro_3 + pp.cajas_carro_4) AS cajas,
           AVG(pp.peso_unidad) AS peso_unidad
    FROM parte_produccion_producto pp
    WHERE pp.fecha_ingreso IS NOT NULL
    GROUP BY pp.variante_id, pp.fecha_ingreso
) ing
JOIN variantes_completas_view vc ON vc.variante_id = ing.variante_id
LEFT JOIN (
    SELECT variante_id, fecha_ingreso, SUM(total_kg) AS kg, SUM(cantidad) AS cajas
    FROM control_salida_items
    WHERE fecha_ingreso IS NOT NULL
    GROUP BY variante_id, fecha_ingreso
) sal ON sal.variante_id = ing.variante_id AND sal.fecha_ingreso = ing.fecha_ingreso";

async fn create_tables(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("Creando tablas...");
    
    conn.execute(CREATE_ESPECIES, ()).await?;
    eprintln!("  ✓ Tabla especies");
    conn.execute(CREATE_PRESENTACIONES, ()).await?;
    eprintln!("  ✓ Tabla presentaciones");
    conn.execute(CREATE_FORMAS_ENVASADO, ()).await?;
    eprintln!("  ✓ Tabla formas_envasado");
    conn.execute(CREATE_FORMAS_EMPACADO, ()).await?;
    eprintln!("  ✓ Tabla formas_empacado");
    conn.execute(CREATE_CALIDADES, ()).await?;
    eprintln!("  ✓ Tabla calidades");
    conn.execute(CREATE_CALIBRES, ()).await?;
    eprintln!("  ✓ Tabla calibres");
    conn.execute(CREATE_VARIANTES, ()).await?;
    eprintln!("  ✓ Tabla variantes");
    
    Ok(())
}

async fn migrate_variantes_schema(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    let mut result = conn.query("PRAGMA table_info(variantes_presentaciones)", ()).await?;
    let mut necesita_migracion = false;
    while let Some(row) = result.next().await? {
        let nombre_columna: String = row.get(1)?;
        if nombre_columna == "forma_envasado_id"
            || nombre_columna == "forma_empacado_id"
            || nombre_columna == "observaciones"
        {
            necesita_migracion = true;
            break;
        }
    }

    if necesita_migracion {
        eprintln!("Migrando variantes_presentaciones al nuevo esquema (especie, presentacion, calidad, calibre, ensunchado)...");
        conn.execute("PRAGMA foreign_keys = OFF", ()).await?;
        conn.execute("DROP VIEW IF EXISTS stock_actual_view", ()).await?;
        conn.execute("DROP VIEW IF EXISTS variantes_completas_view", ()).await?;
        conn.execute("DROP TABLE IF EXISTS variantes_presentaciones", ()).await?;
        conn.execute(CREATE_VARIANTES, ()).await?;
        conn.execute("PRAGMA foreign_keys = ON", ()).await?;
        eprintln!("  ✓ Tabla variantes_presentaciones recreada con el nuevo esquema");
    }

    Ok(())
}

async fn migrate_especies_schema(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    let mut result = conn.query("PRAGMA table_info(especies)", ()).await?;
    let mut tiene_columna = false;
    while let Some(row) = result.next().await? {
        let nombre_columna: String = row.get(1)?;
        if nombre_columna == "peso_unidad_defecto" {
            tiene_columna = true;
            break;
        }
    }

    if !tiene_columna {
        eprintln!("Recreando especies con el nuevo esquema (peso_unidad_defecto)...");
        conn.execute("PRAGMA foreign_keys = OFF", ()).await?;
        conn.execute("DROP TABLE IF EXISTS especies", ()).await?;
        conn.execute(CREATE_ESPECIES, ()).await?;
        conn.execute("PRAGMA foreign_keys = ON", ()).await?;
        eprintln!("  ✓ Tabla especies recreada con el nuevo esquema");
    }

    Ok(())
}

// A diferencia de las migraciones de catalogo, aqui si hay documentos ya
// registrados que deben sobrevivir: se recrea la tabla copiando los items
// existentes, que quedan con fecha_ingreso NULL (lote desconocido).
async fn migrate_control_salida_items_schema(
    conn: &Connection,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut result = conn
        .query("PRAGMA table_info(control_salida_items)", ())
        .await?;
    let mut tiene_tabla = false;
    let mut tiene_columna = false;
    while let Some(row) = result.next().await? {
        tiene_tabla = true;
        let nombre_columna: String = row.get(1)?;
        if nombre_columna == "fecha_ingreso" {
            tiene_columna = true;
            break;
        }
    }

    if !tiene_tabla || tiene_columna {
        return Ok(());
    }

    eprintln!("Migrando control_salida_items para trazabilidad por lote (fecha_ingreso)...");
    conn.execute("PRAGMA foreign_keys = OFF", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_por_lote_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_actual_view", ()).await?;
    conn.execute(
        "ALTER TABLE control_salida_items RENAME TO control_salida_items_old",
        (),
    )
    .await?;
    conn.execute(CREATE_CONTROL_SALIDA_ITEMS, ()).await?;
    conn.execute(
        "INSERT INTO control_salida_items
            (id, control_salida_id, numero_item, variante_id, codigo_trazabilidad,
             cantidad, peso_unidad, total_kg, observaciones, created_at)
         SELECT id, control_salida_id, numero_item, variante_id, codigo_trazabilidad,
                cantidad, peso_unidad, total_kg, observaciones, created_at
         FROM control_salida_items_old",
        (),
    )
    .await?;
    conn.execute("DROP TABLE control_salida_items_old", ()).await?;
    conn.execute("PRAGMA foreign_keys = ON", ()).await?;
    eprintln!("  ✓ control_salida_items migrada conservando los items existentes");

    Ok(())
}

// Recrea la tabla de productos agregando fecha_ingreso y rellenandola con la
// fecha de la cabecera del parte al que pertenece cada fila, para no perder los
// ingresos ya registrados.
async fn migrate_parte_produccion_producto_schema(
    conn: &Connection,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut result = conn
        .query("PRAGMA table_info(parte_produccion_producto)", ())
        .await?;
    let mut tiene_tabla = false;
    let mut tiene_columna = false;
    while let Some(row) = result.next().await? {
        tiene_tabla = true;
        let nombre_columna: String = row.get(1)?;
        if nombre_columna == "fecha_ingreso" {
            tiene_columna = true;
            break;
        }
    }

    if !tiene_tabla || tiene_columna {
        return Ok(());
    }

    eprintln!("Migrando parte_produccion_producto para congelar fecha_ingreso...");
    conn.execute("PRAGMA foreign_keys = OFF", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_por_lote_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_actual_view", ()).await?;
    conn.execute(
        "ALTER TABLE parte_produccion_producto RENAME TO parte_produccion_producto_old",
        (),
    )
    .await?;
    conn.execute(CREATE_PARTE_PRODUCCION_PRODUCTO, ()).await?;
    conn.execute(
        "INSERT INTO parte_produccion_producto
            (id, parte_id, variante_id, fecha_ingreso, peso_unidad, cajas_carro_1,
             cajas_carro_2, cajas_carro_3, cajas_carro_4, peso_total_neto_kg,
             acumulado_presentacion, rendimiento)
         SELECT o.id, o.parte_id, o.variante_id, p.fecha, o.peso_unidad, o.cajas_carro_1,
                o.cajas_carro_2, o.cajas_carro_3, o.cajas_carro_4, o.peso_total_neto_kg,
                o.acumulado_presentacion, o.rendimiento
         FROM parte_produccion_producto_old o
         LEFT JOIN partes_produccion p ON p.id = o.parte_id",
        (),
    )
    .await?;
    conn.execute("DROP TABLE parte_produccion_producto_old", ()).await?;
    conn.execute("PRAGMA foreign_keys = ON", ()).await?;
    eprintln!("  ✓ parte_produccion_producto migrada con fecha_ingreso poblada");

    Ok(())
}

async fn create_transaction_tables(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("Creando tablas de transacciones...");
    
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

// SQLite no permite agregar un CHECK con ALTER TABLE: hay que recrear la tabla.
// Se usa el procedimiento seguro (crear la nueva, copiar, borrar la vieja,
// renombrar) porque algunas de estas tablas tienen hijos con claves foraneas:
// si se renombrara la original primero, SQLite reescribiria esas referencias.
async fn migrar_tabla_con_check_fecha(
    conn: &Connection,
    tabla: &str,
    create_sql: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut result = conn
        .query(
            "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [libsql::Value::from(tabla.to_string())],
        )
        .await?;

    let sql_actual: Option<String> = match result.next().await? {
        Some(row) => Some(row.get(0)?),
        None => None,
    };

    // Si la tabla aun no existe, create_tables la creara ya con el CHECK
    let Some(sql_actual) = sql_actual else {
        return Ok(());
    };
    if sql_actual.contains("GLOB") {
        return Ok(());
    }

    let tabla_nueva = format!("{}_new", tabla);
    let create_nueva = create_sql.replacen(tabla, &tabla_nueva, 1);

    eprintln!("Agregando validacion de formato de fecha a {}...", tabla);
    conn.execute("PRAGMA foreign_keys = OFF", ()).await?;
    // Las vistas se recrean despues; se quitan para que el RENAME no falle al
    // intentar resolver referencias a una tabla que esta siendo reemplazada.
    conn.execute("DROP VIEW IF EXISTS stock_por_lote_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_actual_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS variantes_completas_view", ()).await?;
    conn.execute(&format!("DROP TABLE IF EXISTS {}", tabla_nueva), ()).await?;
    conn.execute(&create_nueva, ()).await?;
    conn.execute(
        &format!("INSERT INTO {} SELECT * FROM {}", tabla_nueva, tabla),
        (),
    )
    .await?;
    conn.execute(&format!("DROP TABLE {}", tabla), ()).await?;
    conn.execute(
        &format!("ALTER TABLE {} RENAME TO {}", tabla_nueva, tabla),
        (),
    )
    .await?;
    conn.execute("PRAGMA foreign_keys = ON", ()).await?;
    eprintln!("  ✓ {} migrada", tabla);

    Ok(())
}

async fn migrate_checks_de_fecha(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    migrar_tabla_con_check_fecha(conn, "partes_produccion", CREATE_PARTES_PRODUCCION).await?;
    migrar_tabla_con_check_fecha(
        conn,
        "parte_produccion_producto",
        CREATE_PARTE_PRODUCCION_PRODUCTO,
    )
    .await?;
    migrar_tabla_con_check_fecha(conn, "controles_salida", CREATE_CONTROLES_SALIDA).await?;
    migrar_tabla_con_check_fecha(conn, "control_salida_items", CREATE_CONTROL_SALIDA_ITEMS).await?;
    Ok(())
}

async fn create_users_table(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("Creando tabla de usuarios...");
    conn.execute(CREATE_USERS, ()).await?;
    Ok(())
}

async fn create_views(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("Creando vistas...");
    // Las vistas se recrean en cada arranque (no almacenan datos propios) para
    // que los cambios de definición se apliquen también sobre una base ya existente,
    // donde "CREATE VIEW IF NOT EXISTS" dejaría la definición vieja intacta.
    conn.execute("DROP VIEW IF EXISTS stock_por_lote_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS stock_actual_view", ()).await?;
    conn.execute("DROP VIEW IF EXISTS variantes_completas_view", ()).await?;
    conn.execute(CREATE_VIEW, ()).await?;
    conn.execute(CREATE_STOCK_ACTUAL_VIEW, ()).await?;
    conn.execute(CREATE_STOCK_POR_LOTE_VIEW, ()).await?;
    Ok(())
}

async fn create_indexes(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    eprintln!("Creando índices de optimización...");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_fecha ON controles_salida(fecha DESC)", ()).await?;
    eprintln!(" Índice idx_controles_salida_fecha");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_especie_id ON controles_salida(especie_id)", ()).await?;
    eprintln!(" Índice idx_controles_salida_especie_id");

    conn.execute("CREATE INDEX IF NOT EXISTS idx_control_salida_items_control_id ON control_salida_items(control_salida_id)", ()).await?;
    eprintln!(" Índice idx_control_salida_items_control_id");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_presentaciones_especie_id ON presentaciones(especie_id)", ()).await?;
    eprintln!(" Índice idx_presentaciones_especie_id");
    
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_producto_parte_id ON parte_produccion_producto(parte_id)", ()).await?;
    eprintln!(" Índice idx_parte_produccion_producto_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_producto_variante_id ON parte_produccion_producto(variante_id)", ()).await?;
    eprintln!(" Índice idx_parte_produccion_producto_variante_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_transporte_parte_id ON parte_produccion_transporte(parte_id)", ()).await?;
    eprintln!(" Índice idx_parte_produccion_transporte_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_embarcacion_transporte_id ON parte_produccion_embarcacion(transporte_id)", ()).await?;
    eprintln!(" Índice idx_parte_produccion_embarcacion_transporte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_parte_produccion_insumo_parte_id ON parte_produccion_insumo(parte_id)", ()).await?;
    eprintln!(" Índice idx_parte_produccion_insumo_parte_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_partes_produccion_especie_id ON partes_produccion(especie_id)", ()).await?;
    eprintln!(" Índice idx_partes_produccion_especie_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_partes_produccion_tipo_documento_id ON partes_produccion(tipo_documento_id)", ()).await?;
    eprintln!(" Índice idx_partes_produccion_tipo_documento_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_control_salida_items_variante_id ON control_salida_items(variante_id)", ()).await?;
    eprintln!(" Índice idx_control_salida_items_variante_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_motivo_salida_id ON controles_salida(motivo_salida_id)", ()).await?;
    eprintln!(" Índice idx_controles_salida_motivo_salida_id");
    conn.execute("CREATE INDEX IF NOT EXISTS idx_controles_salida_tipo_documento_id ON controles_salida(tipo_documento_id)", ()).await?;
    eprintln!(" Índice idx_controles_salida_tipo_documento_id");
    
    Ok(())
}

// Solo abre la conexión a Turso, sin crear/migrar tablas, vistas ni índices.
// Pensado para procesos de corta duración (como el CLI) que se ejecutan
// repetidas veces y ya saben que el esquema está al día: evita repetir en
// cada invocación una docena de sentencias DDL de ida y vuelta a la red.
pub async fn connect_db() -> Result<Database, Box<dyn std::error::Error>> {
    dotenv().ok();

    let database_url = env::var("TURSO_DATABASE_URL")
        .expect("TURSO_DATABASE_URL debe estar configurada en el archivo .env");
    let auth_token = env::var("TURSO_AUTH_TOKEN")
        .expect("TURSO_AUTH_TOKEN debe estar configurada en el archivo .env");

    let db = libsql::Builder::new_remote(database_url, auth_token)
        .build()
        .await?;

    let conn = db.connect()?;
    conn.execute("PRAGMA foreign_keys = ON", ()).await?;

    Ok(db)
}

pub async fn init_db() -> Result<Database, Box<dyn std::error::Error>> {
    dotenv().ok();

    let database_url = env::var("TURSO_DATABASE_URL")
        .expect("TURSO_DATABASE_URL debe estar configurada en el archivo .env");
    let auth_token = env::var("TURSO_AUTH_TOKEN")
        .expect("TURSO_AUTH_TOKEN debe estar configurada en el archivo .env");

    eprintln!("Conectando a Turso en: {}", database_url);

    let db = libsql::Builder::new_remote(database_url, auth_token)
        .build()
        .await?;

    eprintln!("Conexión establecida con Turso");

    let conn = db.connect()?;
    conn.execute("PRAGMA foreign_keys = ON", ()).await?;
    create_tables(&conn).await?;
    migrate_variantes_schema(&conn).await?;
    migrate_especies_schema(&conn).await?;
    create_transaction_tables(&conn).await?;
    migrate_control_salida_items_schema(&conn).await?;
    migrate_parte_produccion_producto_schema(&conn).await?;
    migrate_checks_de_fecha(&conn).await?;
    create_users_table(&conn).await?;
    create_views(&conn).await?;
    create_indexes(&conn).await?;

    eprintln!("Tablas, vistas e índices creados/verificados correctamente");

    Ok(db)
}
