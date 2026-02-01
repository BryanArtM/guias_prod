import { invoke } from "@tauri-apps/api/core";

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Indica si la operación fue exitosa
 * @property {string} message - Mensaje descriptivo del resultado
 * @property {Object} [user] - Datos del usuario (opcional)
 * @property {number} user.id - ID del usuario
 * @property {string} user.username - Nombre de usuario
 * @property {string} user.email - Email del usuario
 * @property {string} [token] - Token JWT (opcional)
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} username - Nombre de usuario
 * @property {string} password - Contraseña
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} username - Nombre de usuario
 * @property {string} email - Email
 * @property {string} password - Contraseña
 */

/**
 * Servicio de autenticación
 * Maneja registro, login y verificación de tokens
 */
export const authService = {
  /**
   * Registrar un nuevo usuario
   * @param {RegisterData} data - Datos del nuevo usuario
   * @returns {Promise<AuthResponse>} Respuesta con usuario y token
   */
  async register(data) {
    try {
      const response = await invoke("register_cmd", { data });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error,
      };
    }
  },

  /**
   * Iniciar sesión
   * @param {LoginCredentials} credentials - Credenciales de acceso
   * @returns {Promise<AuthResponse>} Respuesta con usuario y token
   */
  async login(credentials) {
    try {
      const response = await invoke("login_cmd", { credentials });
      return response;
    } catch (error) {
      return {
        success: false,
        message: error,
      };
    }
  },

  /**
   * Verificar token de autenticación
   * @param {number} userId - ID del usuario a verificar
   * @returns {Promise<Object|null>} Datos del usuario o null si falla
   */
  async verifyToken(userId) {
    try {
      const user = await invoke("verify_token_cmd", { userId });
      return user;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  },
};
