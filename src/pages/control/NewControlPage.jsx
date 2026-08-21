import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ControlSalidaForm,
  limpiarBorradorControlSalida,
} from "@/components/control";
import { Alert, Loading } from "@/components/common";
import { controlService, obtenerEspecies } from "@/services";
import { useFormDraft, limpiarBorradorGuardado } from "@/hooks";

// Claves del borrador local: permiten abandonar la vista y retomar el registro
const BORRADOR_SALIDA = "borrador-control-salida";
const BORRADOR_TIPO = "borrador-control-salida-tipo";

export default function NewControlPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipoDocumento, setTipoDocumento, reiniciarTipo] = useFormDraft(
    BORRADOR_TIPO,
    "EMBARQUE",
  );
  const [especies, setEspecies] = useState([]);
  const [cargando, setCargando] = useState(true);

  const tipos = ["SALIDA", "EMBARQUE", "MUESTREO"];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setEspecies(await obtenerEspecies());
      } catch (err) {
        setError("Error al cargar datos: " + err.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await controlService.crearControlSalida(data);
      limpiarBorradorControlSalida(BORRADOR_SALIDA);
      limpiarBorradorGuardado(BORRADOR_TIPO);
      setSuccess(true);
      setTimeout(() => navigate("/salidas"), 2000);
    } catch (err) {
      setError(
        "Error al guardar: " +
          (typeof err === "string" ? err : err.message || JSON.stringify(err)),
      );
    }
  };

  const handleCancel = () => {
    setError(null);
    reiniciarTipo();
  };

  if (success)
    return (
      <div className="px-5 py-4">
        <Alert variant="success">
          Documento guardado correctamente. Redirigiendo...
        </Alert>
        <Loading />
      </div>
    );
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
            key={tipo}
            type="button"
            onClick={() => setTipoDocumento(tipo)}
            className={`border px-3 py-1.5 text-xs font-medium tracking-[0.06em] uppercase transition-colors ${
              tipoDocumento === tipo
                ? "border-navy bg-navy text-white"
                : "border-line text-ink-muted hover:border-steel hover:text-ink"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>
      <ControlSalidaForm
        tipoDocumento={tipoDocumento}
        especies={especies}
        borradorKey={BORRADOR_SALIDA}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
