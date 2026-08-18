import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading, Alert } from "@/components/common";
import ControlSalidaForm from "@/components/control/ControlSalidaForm";
import { controlService, obtenerEspecies } from "@/services";

export default function EditarSalidasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [especies, setEspecies] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [control, especiesData] = await Promise.all([
          controlService.obtenerControlSalida(id),
          obtenerEspecies(),
        ]);
        setInitialData(control);
        setEspecies(especiesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleSubmit = async (data) => {
    try {
      await controlService.actualizarControlSalida(id, data);
      navigate(`/salidas/${id}`);
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  if (cargando) return <Loading />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <ControlSalidaForm
      tipoDocumento={initialData?.tipo_documento_codigo || "EMBARQUE"}
      initialData={initialData}
      especies={especies}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
