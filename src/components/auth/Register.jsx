import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { UserPlus } from "lucide-react";
import { Button, Input, Card, Alert } from "../common";

const registerSchema = z
  .object({
    username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);

      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        navigate("/");
      } else {
        setError(response.message || "Error al registrarse");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <Card className="max-w-md w-full" padding="xl">
        <div className="flex justify-center mb-6">
          <div className="bg-green-600 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Crear Cuenta
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Regístrate para comenzar
        </p>

        {error && (
          <Alert variant="error" onClose={() => setError("")} className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register("username")}
            label="Usuario"
            type="text"
            placeholder="Elige un nombre de usuario"
            error={errors.username?.message}
            fullWidth
            required
          />

          <Input
            {...register("email")}
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            fullWidth
            required
          />

          <Input
            {...register("password")}
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            fullWidth
            required
          />

          <Input
            {...register("confirmPassword")}
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            error={errors.confirmPassword?.message}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="success"
            loading={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-green-600 hover:text-green-700 font-medium inline"
            >
              Inicia sesión aquí
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
