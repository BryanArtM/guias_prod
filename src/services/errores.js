/**
 * Traduce los errores crudos que devuelve el backend a algo que el usuario
 * pueda entender y accionar. Los mensajes que el propio backend escribe en
 * espanol ya sirven y se dejan pasar tal cual; solo se reescriben los tecnicos
 * (serializacion de Tauri, restricciones de SQLite), que ademas se conservan
 * como detalle para poder reportarlos.
 */

const NOMBRES_DE_CAMPO = {
  nombre: "nombre",
  codigo: "código",
  razon_social: "razón social",
  numero_control: "número de control",
  abreviatura_trazabilidad: "abreviatura de trazabilidad",
};

function nombreLegible(campoConTabla) {
  const campo = campoConTabla.split(".").pop();
  return NOMBRES_DE_CAMPO[campo] || campo.replace(/_/g, " ");
}

const PATRONES = [
  {
    // Tauri no pudo deserializar los argumentos del comando. En la practica
    // siempre es un campo obligatorio que viaja vacio ("" o null) donde el
    // backend espera un numero.
    prueba: /invalid args .*invalid type/i,
    titulo: "Datos incompletos",
    mensaje:
      "Falta completar un campo obligatorio del documento, o alguno tiene un formato que el sistema no reconoce. Revise las selecciones antes de guardar.",
  },
  {
    prueba: /UNIQUE constraint failed: ([\w.]+)/i,
    titulo: "Registro duplicado",
    mensaje: (coincidencia) =>
      `Ya existe un registro con ese ${nombreLegible(coincidencia[1])}.`,
  },
  {
    prueba: /NOT NULL constraint failed: ([\w.]+)/i,
    titulo: "Datos incompletos",
    mensaje: (coincidencia) =>
      `Falta completar el campo ${nombreLegible(coincidencia[1])}.`,
  },
  {
    prueba: /FOREIGN KEY constraint failed/i,
    titulo: "Registro en uso",
    mensaje:
      "No se puede completar la operación porque el registro está siendo usado por otros documentos.",
  },
  {
    prueba: /Token (inv[aá]lido|expirado)/i,
    titulo: "Sesión expirada",
    mensaje: "La sesión ya no es válida. Vuelva a iniciar sesión.",
  },
  {
    prueba: /database is locked|no such table|disk I\/O error/i,
    titulo: "Error de base de datos",
    mensaje:
      "No se pudo acceder a la base de datos. Reintente en unos segundos y avise a soporte si continúa.",
  },
];

function textoDeError(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error.message === "string" && error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * @param {unknown} error - lo que sea que haya lanzado el backend
 * @param {string} respaldo - mensaje a usar si el error viene vacio
 * @returns {{titulo: string, mensaje: string, detalle: string|null}}
 */
export function describirError(error, respaldo = "Ocurrió un error inesperado") {
  const texto = textoDeError(error).trim();

  if (!texto) {
    return { titulo: "Error", mensaje: respaldo, detalle: null };
  }

  for (const patron of PATRONES) {
    const coincidencia = texto.match(patron.prueba);
    if (coincidencia) {
      return {
        titulo: patron.titulo,
        mensaje:
          typeof patron.mensaje === "function"
            ? patron.mensaje(coincidencia)
            : patron.mensaje,
        detalle: texto,
      };
    }
  }

  // Mensaje propio del dominio: ya viene redactado, no hay nada que traducir.
  return { titulo: "Error", mensaje: texto, detalle: null };
}

/** Version corta, para las alertas de una sola linea de los listados. */
export function mensajeDeError(error, respaldo) {
  return describirError(error, respaldo).mensaje;
}
