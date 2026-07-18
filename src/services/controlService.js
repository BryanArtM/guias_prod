import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores";

export const controlService = {
  async crearControlSalida(control) {
    const token = useAuthStore.getState().token;
    return await invoke("crear_control_salida_cmd", { token, control });
  },

  async obtenerControlSalida(id) {
    const token = useAuthStore.getState().token;
    return await invoke("obtener_control_salida_por_id_cmd", {
      token,
      id: Number(id),
    });
  },

  async actualizarControlSalida(id, control) {
    const token = useAuthStore.getState().token;
    return await invoke("actualizar_control_salida_cmd", {
      token,
      id: Number(id),
      control,
    });
  },

  async eliminarControlSalida(id) {
    const token = useAuthStore.getState().token;
    return await invoke("eliminar_control_salida_cmd", {
      token,
      id: Number(id),
    });
  },
};
