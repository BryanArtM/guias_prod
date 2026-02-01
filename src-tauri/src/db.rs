use rusqlite::{Connection, Result};
use std::sync::Mutex;
#[allow(unused_imports)]
use tauri::State;
use serde::{Deserialize, Serialize};

// Importar el módulo auth
use crate::auth;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Producto {
    pub id: Option<i64>,
    pub codigo: String,
    pub nombre: String,
    pub unidad: String,
    pub descripcion: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Guia {
    pub id: Option<i64>,
    pub numero_guia: String,
    pub fecha: String,
    pub responsable: String,
    pub observaciones: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuiaDetalle {
    pub id: Option<i64>,
    pub guia_id: i64,
    pub producto_id: i64,
    pub cantidad: f64,
    pub lote: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuiaCompleta {
    pub guia: Guia,
    pub detalles: Vec<GuiaDetalleConProducto>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GuiaDetalleConProducto {
    pub id: Option<i64>,
    pub guia_id: i64,
    pub producto_id: i64,
    pub cantidad: f64,
    pub lote: String,
    pub producto_nombre: String,
    pub producto_codigo: String,
    pub producto_unidad: String,
}

pub struct AppState {
    pub db: Mutex<Connection>,
}

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("guias_produccion.db")?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            unidad TEXT NOT NULL,
            descripcion TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS guias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero_guia TEXT NOT NULL UNIQUE,
            fecha TEXT NOT NULL,
            responsable TEXT NOT NULL,
            observaciones TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS guia_detalle (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guia_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            cantidad REAL NOT NULL,
            lote TEXT NOT NULL,
            FOREIGN KEY (guia_id) REFERENCES guias(id) ON DELETE CASCADE,
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        )",
        [],
    )?;

    // Inicializar tabla de usuarios
    auth::init_users_table(&conn)?;

    Ok(conn)
}

// CRUD Productos
pub fn crear_producto(conn: &Connection, producto: &Producto) -> Result<i64> {
    conn.execute(
        "INSERT INTO productos (codigo, nombre, unidad, descripcion) VALUES (?1, ?2, ?3, ?4)",
        (&producto.codigo, &producto.nombre, &producto.unidad, &producto.descripcion),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_productos(conn: &Connection) -> Result<Vec<Producto>> {
    let mut stmt = conn.prepare("SELECT id, codigo, nombre, unidad, descripcion FROM productos ORDER BY nombre")?;
    let productos_iter = stmt.query_map([], |row| {
        Ok(Producto {
            id: Some(row.get(0)?),
            codigo: row.get(1)?,
            nombre: row.get(2)?,
            unidad: row.get(3)?,
            descripcion: row.get(4)?,
        })
    })?;

    let mut productos = Vec::new();
    for producto in productos_iter {
        productos.push(producto?);
    }
    Ok(productos)
}

pub fn obtener_producto(conn: &Connection, id: i64) -> Result<Producto> {
    conn.query_row(
        "SELECT id, codigo, nombre, unidad, descripcion FROM productos WHERE id = ?1",
        [id],
        |row| {
            Ok(Producto {
                id: Some(row.get(0)?),
                codigo: row.get(1)?,
                nombre: row.get(2)?,
                unidad: row.get(3)?,
                descripcion: row.get(4)?,
            })
        },
    )
}

pub fn actualizar_producto(conn: &Connection, id: i64, producto: &Producto) -> Result<()> {
    conn.execute(
        "UPDATE productos SET codigo = ?1, nombre = ?2, unidad = ?3, descripcion = ?4 WHERE id = ?5",
        (&producto.codigo, &producto.nombre, &producto.unidad, &producto.descripcion, id),
    )?;
    Ok(())
}

pub fn eliminar_producto(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM productos WHERE id = ?1", [id])?;
    Ok(())
}

// CRUD Guías
pub fn crear_guia(conn: &Connection, guia: &Guia) -> Result<i64> {
    conn.execute(
        "INSERT INTO guias (numero_guia, fecha, responsable, observaciones) VALUES (?1, ?2, ?3, ?4)",
        (&guia.numero_guia, &guia.fecha, &guia.responsable, &guia.observaciones),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_guias(conn: &Connection) -> Result<Vec<Guia>> {
    let mut stmt = conn.prepare("SELECT id, numero_guia, fecha, responsable, observaciones FROM guias ORDER BY fecha DESC, numero_guia DESC")?;
    let guias_iter = stmt.query_map([], |row| {
        Ok(Guia {
            id: Some(row.get(0)?),
            numero_guia: row.get(1)?,
            fecha: row.get(2)?,
            responsable: row.get(3)?,
            observaciones: row.get(4)?,
        })
    })?;

    let mut guias = Vec::new();
    for guia in guias_iter {
        guias.push(guia?);
    }
    Ok(guias)
}

pub fn obtener_guia(conn: &Connection, id: i64) -> Result<Guia> {
    conn.query_row(
        "SELECT id, numero_guia, fecha, responsable, observaciones FROM guias WHERE id = ?1",
        [id],
        |row| {
            Ok(Guia {
                id: Some(row.get(0)?),
                numero_guia: row.get(1)?,
                fecha: row.get(2)?,
                responsable: row.get(3)?,
                observaciones: row.get(4)?,
            })
        },
    )
}

pub fn actualizar_guia(conn: &Connection, id: i64, guia: &Guia) -> Result<()> {
    conn.execute(
        "UPDATE guias SET numero_guia = ?1, fecha = ?2, responsable = ?3, observaciones = ?4 WHERE id = ?5",
        (&guia.numero_guia, &guia.fecha, &guia.responsable, &guia.observaciones, id),
    )?;
    Ok(())
}

pub fn eliminar_guia(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM guia_detalle WHERE guia_id = ?1", [id])?;
    conn.execute("DELETE FROM guias WHERE id = ?1", [id])?;
    Ok(())
}

// CRUD Guía Detalle
pub fn crear_guia_detalle(conn: &Connection, detalle: &GuiaDetalle) -> Result<i64> {
    conn.execute(
        "INSERT INTO guia_detalle (guia_id, producto_id, cantidad, lote) VALUES (?1, ?2, ?3, ?4)",
        (detalle.guia_id, detalle.producto_id, detalle.cantidad, &detalle.lote),
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn obtener_detalles_guia(conn: &Connection, guia_id: i64) -> Result<Vec<GuiaDetalleConProducto>> {
    let mut stmt = conn.prepare(
        "SELECT gd.id, gd.guia_id, gd.producto_id, gd.cantidad, gd.lote, p.nombre, p.codigo, p.unidad
         FROM guia_detalle gd
         INNER JOIN productos p ON gd.producto_id = p.id
         WHERE gd.guia_id = ?1
         ORDER BY p.nombre"
    )?;
    
    let detalles_iter = stmt.query_map([guia_id], |row| {
        Ok(GuiaDetalleConProducto {
            id: Some(row.get(0)?),
            guia_id: row.get(1)?,
            producto_id: row.get(2)?,
            cantidad: row.get(3)?,
            lote: row.get(4)?,
            producto_nombre: row.get(5)?,
            producto_codigo: row.get(6)?,
            producto_unidad: row.get(7)?,
        })
    })?;

    let mut detalles = Vec::new();
    for detalle in detalles_iter {
        detalles.push(detalle?);
    }
    Ok(detalles)
}

pub fn eliminar_detalle_guia(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM guia_detalle WHERE id = ?1", [id])?;
    Ok(())
}

pub fn obtener_guia_completa(conn: &Connection, guia_id: i64) -> Result<GuiaCompleta> {
    let guia = obtener_guia(conn, guia_id)?;
    let detalles = obtener_detalles_guia(conn, guia_id)?;
    
    Ok(GuiaCompleta {
        guia,
        detalles,
    })
}
