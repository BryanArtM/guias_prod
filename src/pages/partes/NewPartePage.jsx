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
      <div className="px-5 py-4">
        <Alert variant="success">
          Documento guardado correctamente. Redirigiendo a los ingresos...
        </Alert>
        <Loading />
      </div>
    );
  }
  if (cargando) return <Loading />;

  return (
    <div className="px-5 py-4">
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
            className={`border px-3 py-1.5 text-xs font-medium tracking-[0.06em] uppercase transition-colors ${
              tipoSeleccionado?.id === tipo.id
                ? "border-navy bg-navy text-white"
                : "border-line text-ink-muted hover:border-steel hover:text-ink"
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
