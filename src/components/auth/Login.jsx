import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";
import { LogIn } from "lucide-react";
import { Button, Input, Card, Alert } from "@/components/common";

const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});
export function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(data);

      if (response.success && response.user && response.token) {
        login(response.user, response.token);
        navigate("/");
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="max-w-md w-full" padding="xl">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-full">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Iniciar Sesión
        </h2>
        <p className="text-center text-gray-600 mb-6">Accede a tu cuenta</p>

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
            placeholder="Ingresa tu usuario"
            error={errors.username?.message}
            fullWidth
            required
          />

          <Input
            {...register("password")}
            label="Contraseña"
            type="password"
            placeholder="Ingresa tu contraseña"
            error={errors.password?.message}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            fullWidth
            size="lg"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/register")}
              className="text-blue-600 hover:text-blue-700 font-medium inline"
            >
              Regístrate aquí
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
