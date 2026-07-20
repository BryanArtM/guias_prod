import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading, Alert } from "@/components/common";
import ControlSalidaForm from "@/components/control/ControlSalidaForm";
import { controlService } from "@/services";
import { obtenerEspecies, obtenerVariantesCompletas } from "@/services";

export default function EditarSalidasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [especies, setEspecies] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [control, especiesData, variantesData] = await Promise.all([
          controlService.obtenerControlSalida(id),
          obtenerEspecies(),
          obtenerVariantesCompletas(),
        ]);
        setInitialData(control);
        setEspecies(especiesData);
        setVariantes(variantesData);
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
      variantes={variantes}
      onSubmit={handleSubmit}
      onCancel={() => navigate(-1)}
    />
  );
}
