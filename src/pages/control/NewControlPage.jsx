import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ControlSalidaForm } from "@/components/control";
import { Alert, Loading } from "@/components/common";
import { controlService, obtenerEspecies } from "@/services";

export default function NewControlPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("EMBARQUE");
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
      setSuccess(true);
      setTimeout(() => navigate("/salidas"), 2000);
    } catch (err) {
      setError(
        "Error al guardar: " +
          (typeof err === "string" ? err : err.message || JSON.stringify(err)),
      );
    }
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
        onSubmit={handleSubmit}
        onCancel={() => navigate("/salidas")}
      />
    </div>
  );
}
