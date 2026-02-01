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
    return await invoke(command, { token: getToken(), ...args });
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

// ==================== PRODUCTOS ====================

export const crearProducto = (producto) => {
  return invokeWithAuth("crear_producto_cmd", { producto });
};

export const obtenerProductos = () => {
  return invokeWithAuth("obtener_productos_cmd");
};

export const obtenerProducto = (id) => {
  return invokeWithAuth("obtener_producto_cmd", { id });
};

export const actualizarProducto = (id, producto) => {
  return invokeWithAuth("actualizar_producto_cmd", { id, producto });
};

export const eliminarProducto = (id) => {
  return invokeWithAuth("eliminar_producto_cmd", { id });
};

// ==================== GUÍAS ====================

export const crearGuia = (guia) => {
  return invokeWithAuth("crear_guia_cmd", { guia });
};

export const obtenerGuias = () => {
  return invokeWithAuth("obtener_guias_cmd");
};

export const obtenerGuia = (id) => {
  return invokeWithAuth("obtener_guia_cmd", { id });
};

export const actualizarGuia = (id, guia) => {
  return invokeWithAuth("actualizar_guia_cmd", { id, guia });
};

export const eliminarGuia = (id) => {
  return invokeWithAuth("eliminar_guia_cmd", { id });
};

// ==================== GUÍA DETALLE ====================

export const crearGuiaDetalle = (detalle) => {
  return invokeWithAuth("crear_guia_detalle_cmd", { detalle });
};

export const obtenerDetallesGuia = (guiaId) => {
  return invokeWithAuth("obtener_detalles_guia_cmd", { guiaId });
};

export const eliminarDetalleGuia = (id) => {
  return invokeWithAuth("eliminar_detalle_guia_cmd", { id });
};

export const obtenerGuiaCompleta = (guiaId) => {
  return invokeWithAuth("obtener_guia_completa_cmd", { guiaId });
};
