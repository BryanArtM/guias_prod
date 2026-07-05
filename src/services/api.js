import { invoke } from "@tauri-apps/api/core";

const getToken = () => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    return state?.token || "";
  }
  return "";
};

const invokeWithAuth = async (command, args = {}) => {
  try {
    const result = await invoke(command, { token: getToken(), ...args });
    return result;
  } catch (error) {
    // Si el error es de autenticación, limpiar el store y redirigir al login
    const errorMsg = String(error);
    if (
      errorMsg.includes("Token inválido") ||
      errorMsg.includes("Token expirado")
    ) {
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    throw error;
  }
};

// ==================== ESPECIES ====================

export const crearEspecie = (especie) => {
  return invokeWithAuth("crear_especie_cmd", { especie });
};

export const obtenerEspecies = () => {
  return invokeWithAuth("obtener_especies_cmd");
};

export const obtenerEspecie = (id) => {
  return invokeWithAuth("obtener_especie_cmd", { id });
};

export const actualizarEspecie = (id, especie) => {
  return invokeWithAuth("actualizar_especie_cmd", { id, especie });
};

export const eliminarEspecie = (id) => {
  return invokeWithAuth("eliminar_especie_cmd", { id });
};

// ==================== PRESENTACIONES ====================

export const crearPresentacion = (presentacion) => {
  return invokeWithAuth("crear_presentacion_cmd", { presentacion });
};

export const obtenerPresentaciones = () => {
  return invokeWithAuth("obtener_presentaciones_cmd");
};

export const obtenerPresentacionesPorEspecie = (especieId) => {
  return invokeWithAuth("obtener_presentaciones_por_especie_cmd", {
    especieId: especieId,
  });
};

export const actualizarPresentacion = (id, presentacion) => {
  return invokeWithAuth("actualizar_presentacion_cmd", { id, presentacion });
};

export const eliminarPresentacion = (id) => {
  return invokeWithAuth("eliminar_presentacion_cmd", { id });
};

// ==================== FORMAS DE ENVASADO ====================

export const crearFormaEnvasado = (forma) => {
  return invokeWithAuth("crear_forma_envasado_cmd", { forma });
};

export const obtenerFormasEnvasado = () => {
  return invokeWithAuth("obtener_formas_envasado_cmd");
};

export const actualizarFormaEnvasado = (id, forma) => {
  return invokeWithAuth("actualizar_forma_envasado_cmd", { id, forma });
};

export const eliminarFormaEnvasado = (id) => {
  return invokeWithAuth("eliminar_forma_envasado_cmd", { id });
};

// ==================== FORMAS DE EMPACADO ====================

export const crearFormaEmpacado = (forma) => {
  return invokeWithAuth("crear_forma_empacado_cmd", { forma });
};

export const obtenerFormasEmpacado = () => {
  return invokeWithAuth("obtener_formas_empacado_cmd");
};

export const actualizarFormaEmpacado = (id, forma) => {
  return invokeWithAuth("actualizar_forma_empacado_cmd", { id, forma });
};

export const eliminarFormaEmpacado = (id) => {
  return invokeWithAuth("eliminar_forma_empacado_cmd", { id });
};

// ==================== CALIDADES ====================

export const crearCalidad = (calidad) => {
  return invokeWithAuth("crear_calidad_cmd", { calidad });
};

export const obtenerCalidades = () => {
  return invokeWithAuth("obtener_calidades_cmd");
};

export const actualizarCalidad = (id, calidad) => {
  return invokeWithAuth("actualizar_calidad_cmd", { id, calidad });
};

export const eliminarCalidad = (id) => {
  return invokeWithAuth("eliminar_calidad_cmd", { id });
};

// ==================== CALIBRES ====================

export const crearCalibre = (calibre) => {
  return invokeWithAuth("crear_calibre_cmd", { calibre });
};

export const obtenerCalibres = () => {
  return invokeWithAuth("obtener_calibres_cmd");
};

export const actualizarCalibre = (id, calibre) => {
  return invokeWithAuth("actualizar_calibre_cmd", { id, calibre });
};

export const eliminarCalibre = (id) => {
  return invokeWithAuth("eliminar_calibre_cmd", { id });
};

// ==================== VARIANTES DE PRESENTACIONES ====================

export const crearVariantePresentacion = (variante) => {
  return invokeWithAuth("crear_variante_presentacion_cmd", { variante });
};

export const obtenerVariantesPresentaciones = () => {
  return invokeWithAuth("obtener_variantes_presentaciones_cmd");
};

export const obtenerVariantesCompletas = () => {
  return invokeWithAuth("obtener_variantes_completas_cmd");
};

export const actualizarVariantePresentacion = (id, variante) => {
  return invokeWithAuth("actualizar_variante_presentacion_cmd", {
    id,
    variante,
  });
};

export const eliminarVariantePresentacion = (id) => {
  return invokeWithAuth("eliminar_variante_presentacion_cmd", { id });
};

// ==================== TIPOS DE INGRESO ====================

export const obtenerTiposIngreso = () => {
  return invokeWithAuth("obtener_tipos_ingreso_cmd");
};

export const obtenerTiposDocumentoProduccion = () => {
  return invokeWithAuth("obtener_tipos_documento_produccion_cmd");
};

export const obtenerTiposDocumentoSalida = () => {
  return invokeWithAuth("obtener_tipos_documento_salida_cmd");
};

// ==================== INGRESOS ====================

export const crearIngreso = (ingreso) => {
  return invokeWithAuth("crear_ingreso_cmd", { ingreso });
};

export const obtenerIngresos = () => {
  return invokeWithAuth("obtener_ingresos_cmd");
};

// Paginación de ingresos
export const obtenerIngresosPaginados = (limite = 50, offset = 0) => {
  return invokeWithAuth("obtener_ingresos_paginados_cmd", { limite, offset });
};

export const contarIngresos = () => {
  return invokeWithAuth("contar_ingresos_cmd");
};

// Batch insert para importación masiva
export const crearIngresosBatch = (ingresos) => {
  return invokeWithAuth("crear_ingresos_batch_cmd", { ingresos });
};

export const actualizarIngreso = (id, ingreso) => {
  return invokeWithAuth("actualizar_ingreso_cmd", { id, ingreso });
};

export const eliminarIngreso = (id) => {
  return invokeWithAuth("eliminar_ingreso_cmd", { id });
};

// ==================== TIPOS DE SALIDA ====================

export const obtenerTiposSalida = () => {
  return invokeWithAuth("obtener_tipos_salida_cmd");
};

export const obtenerMotivosSalida = () => {
  return invokeWithAuth("obtener_motivos_salida_cmd");
};

// ==================== SALIDAS ====================

export const crearSalida = (salida) => {
  return invokeWithAuth("crear_salida_cmd", { salida });
};

export const obtenerSalidas = () => {
  return invokeWithAuth("obtener_salidas_cmd");
};

// Paginación de salidas
export const obtenerSalidasPaginadas = (limite = 50, offset = 0) => {
  return invokeWithAuth("obtener_salidas_paginadas_cmd", { limite, offset });
};

export const contarSalidas = () => {
  return invokeWithAuth("contar_salidas_cmd");
};

// Batch insert para importación masiva
export const crearSalidasBatch = (salidas) => {
  return invokeWithAuth("crear_salidas_batch_cmd", { salidas });
};

export const actualizarSalida = (id, salida) => {
  return invokeWithAuth("actualizar_salida_cmd", { id, salida });
};

export const eliminarSalida = (id) => {
  return invokeWithAuth("eliminar_salida_cmd", { id });
};

// ==================== CONSULTAS ====================

export const obtenerStockPorVariante = () => {
  return invokeWithAuth("obtener_stock_por_variante_cmd");
};

// ==================== DIAGNÓSTICO ====================

export const diagnosticarDB = () => {
  return invokeWithAuth("diagnosticar_db_cmd");
};
