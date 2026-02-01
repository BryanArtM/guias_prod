/**
 * @typedef {Object} Producto
 * @property {number} [id] - ID del producto (opcional)
 * @property {string} codigo - Código único del producto
 * @property {string} nombre - Nombre del producto
 * @property {string} unidad - Unidad de medida (kg, unidades, etc.)
 * @property {string} descripcion - Descripción del producto
 */

/**
 * @typedef {Object} Guia
 * @property {number} [id] - ID de la guía (opcional)
 * @property {string} numero_guia - Número único de la guía
 * @property {string} fecha - Fecha de creación (formato ISO)
 * @property {string} responsable - Nombre del responsable
 * @property {string} observaciones - Observaciones adicionales
 */

/**
 * @typedef {Object} GuiaDetalle
 * @property {number} [id] - ID del detalle (opcional)
 * @property {number} guia_id - ID de la guía asociada
 * @property {number} producto_id - ID del producto
 * @property {number} cantidad - Cantidad del producto
 * @property {string} lote - Número de lote
 */

/**
 * @typedef {Object} GuiaDetalleConProducto
 * @property {number} [id] - ID del detalle (opcional)
 * @property {number} guia_id - ID de la guía asociada
 * @property {number} producto_id - ID del producto
 * @property {number} cantidad - Cantidad del producto
 * @property {string} lote - Número de lote
 * @property {string} producto_nombre - Nombre del producto
 * @property {string} producto_codigo - Código del producto
 * @property {string} producto_unidad - Unidad de medida del producto
 */

/**
 * @typedef {Object} GuiaCompleta
 * @property {Guia} guia - Información completa de la guía
 * @property {GuiaDetalleConProducto[]} detalles - Array de detalles con información de productos
 */

export {};
