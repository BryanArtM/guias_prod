import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ControlSalidaForm } from "@/components/control";
import { Alert, Loading } from "@/components/common";
import {
  controlService,
  obtenerEspecies,
  obtenerVariantesCompletas,
} from "@/services";

export default function NewControlPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("EMBARQUE");
  const [especies, setEspecies] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  const tipos = ["SALIDA", "EMBARQUE", "MUESTREO"];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [variantesData, especiesData] = await Promise.all([
          obtenerVariantesCompletas(),
          obtenerEspecies(),
        ]);
        setVariantes(variantesData);
        setEspecies(especiesData);
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
      <div className="container mx-auto px-4 py-8">
        <Alert variant="success">
          Documento guardado correctamente. Redirigiendo...
        </Alert>
        <Loading />
      </div>
    );
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
            key={tipo}
            type="button"
            onClick={() => setTipoDocumento(tipo)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              tipoDocumento === tipo
                ? "bg-blue-900 text-white border-blue-900"
                : "text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>
      <ControlSalidaForm
        tipoDocumento={tipoDocumento}
        especies={especies}
        variantes={variantes}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/salidas")}
      />
    </div>
  );
}
