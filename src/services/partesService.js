import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores";

export const partesService = {
  async crearParte(parte) {
    const token = useAuthStore.getState().token;
    return await invoke("crear_parte_produccion_cmd", { token, parte });
  },

  async obtenerPartes(tipoDocumentoId = null) {
    const token = useAuthStore.getState().token;
    return await invoke("obtener_partes_produccion_cmd", {
      token,
      tipo_documento_id: tipoDocumentoId,
    });
  },
};
