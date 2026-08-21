import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParteProduccionForm } from "@/components/partes";
import { Alert, Loading } from "@/components/common";
import { partesService, obtenerTiposDocumentoProduccion } from "@/services";
import { useFormDraft, limpiarBorradorGuardado } from "@/hooks";

// Claves del borrador local: permiten abandonar la vista y retomar el registro
const BORRADOR_PARTE = "borrador-parte-produccion";
const BORRADOR_TIPO = "borrador-parte-produccion-tipo";

export default function NewPartePage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionadoId, setTipoSeleccionadoId, reiniciarTipo] =
    useFormDraft(BORRADOR_TIPO, null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const data = await obtenerTiposDocumentoProduccion();
        setTipos(data);
        if (data.length > 0) {
          setTipoSeleccionadoId((actual) => actual ?? data[0].id);
        }
      } catch (err) {
        setError("Error al cargar tipos de documento: " + err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarTipos();
  }, [setTipoSeleccionadoId]);

  const tipoSeleccionado = tipos.find(
    (tipo) => String(tipo.id) === String(tipoSeleccionadoId),
  );

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await partesService.crearParte({
        ...data,
        tipo_documento_id: tipoSeleccionado?.id,
      });
      limpiarBorradorGuardado(BORRADOR_PARTE);
      limpiarBorradorGuardado(BORRADOR_TIPO);
      setSuccess(true);
      setTimeout(() => navigate("/ingresos"), 2000);
    } catch (err) {
      setError("Error al guardar: " + err);
    }
  };

  const handleCancel = () => {
    setError(null);
    reiniciarTipo(tipos.length > 0 ? tipos[0].id : null);
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
            onClick={() => setTipoSeleccionadoId(tipo.id)}
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
        borradorKey={BORRADOR_PARTE}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
