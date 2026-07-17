import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParteProduccionForm } from "@/components/partes";
import { Alert, Loading } from "@/components/common";
import { partesService, obtenerTiposDocumentoProduccion } from "@/services";

export default function NewPartePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const data = await obtenerTiposDocumentoProduccion();
        setTipos(data);
        if (data.length > 0) setTipoSeleccionado(data[0]);
      } catch (err) {
        setError("Error al cargar tipos de documento: " + err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarTipos();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await partesService.crearParte({
        ...data,
        tipo_documento_id: tipoSeleccionado?.id,
      });
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
  if (cargando) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-10">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <div className="flex mb-6 justify-center gap-4 flex-wrap">
        {tipos.map((tipo) => (
          <button
            key={tipo.id}
            type="button"
            onClick={() => setTipoSeleccionado(tipo)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              tipoSeleccionado?.id === tipo.id
                ? "bg-blue-900 text-white border-blue-900"
                : "text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {tipo.codigo}
          </button>
        ))}
      </div>
      <ParteProduccionForm
        tipo={tipoSeleccionado?.id}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/ingresos")}
      />
    </div>
  );
}
