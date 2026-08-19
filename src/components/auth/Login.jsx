import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import { useAuthStore } from "@/stores";
import { Button, Input, Card, Alert } from "@/components/common";
import imgGuia from "@/assets/Guias_Prod.png";

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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Card className="max-w-md w-full" padding="xl">
        <div className="flex justify-center mb-6">
            <img src={imgGuia} alt="Guía"  className="w-20 h-20 text-white" />
        </div>

        <h2 className="mb-1 text-center text-lg font-semibold text-ink">
          SISTEMA PESQUERO
        </h2>
        <p className="label-col mb-5 text-center">Control de Producción</p>

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
          <p className="text-sm text-ink-muted">
            ¿No tienes una cuenta?{" "}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/register")}
            >
              Registrate aquí
            </Button>
          </p>
        </div>
      </Card>
    </div>
  );
}
