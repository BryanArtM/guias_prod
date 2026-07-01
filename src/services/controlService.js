import { invoke } from "@tauri-apps/api/core";
import { useAuthStore } from "@/stores";

export const controlService = {
  async crearControlSalida(control) {
    const token = useAuthStore.getState().token;
    return await invoke("crear_control_salida_cmd", {
      token,
      control,
    });
  },
};
