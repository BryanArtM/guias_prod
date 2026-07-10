import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores";

export const partesService = {
  async crearParte(parte) {
    const token = useAuthStore.getState().token;
    return await invoke("crear_parte_produccion_cmd", { token, parte });
  },
  async actualizarParte(id, parte) {
    const token = useAuthStore.getState().token;
    return await invoke("actualizar_parte_produccion_cmd", {
      token,
      id: Number(id),
      parte,
    });
  },

  async obtenerPartes(tipoDocumentoId = null) {
    const token = useAuthStore.getState().token;
    return await invoke("obtener_partes_produccion_cmd", {
      token,
      tipo_documento_id: tipoDocumentoId,
    });
  },

  async obtenerParte(id) {
    const token = useAuthStore.getState().token;
    return await invoke("obtener_parte_produccion_por_id_cmd", {
      token,
      id: Number(id),
    });
  },
};
