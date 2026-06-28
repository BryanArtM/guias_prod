import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParteProduccionForm } from "@/components/partes";
import { Alert, Loading } from "@/components/common";
import { partesService } from "@/services";

export default function NewPartePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipo, setTipo] = useState("PRODUCCION");

  const tipos = ["PRODUCCION", "DESEMBARQUE", "DIRIMENCIA"];

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await partesService.crearParte(data);
      setSuccess(true);
      setTimeout(() => navigate("/ingresos"), 2000);
    } catch (err) {
      setError("Error al guardar: " + err);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="success">
          Documento guardado correctamente. Redirigiendo a los ingresos...
        </Alert>
        <Loading />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex gap-2 mb-6">
        {tipos.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              tipo === t
                ? "bg-blue-900 text-white border-blue-900"
                : "text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ParteProduccionForm tipo={tipo} onSubmit={handleSubmit} />
    </div>
  );
}
