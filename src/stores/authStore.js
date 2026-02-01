import { create } from "zustand";
import { persist } from "zustand/middleware";


/**
 * Store de autenticación con Zustand
 * Maneja el estado global de autenticación con persistencia en localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),

    {
      name: "auth-storage", // nombre en localStorage
    },
  ),
);
