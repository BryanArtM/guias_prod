import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading, Alert } from "@/components/common";
import ParteProduccionForm from "@/components/partes/ParteProduccionForm";
import { partesService } from "@/services";

export default function EditarIngresosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await partesService.obtenerParte(id);
        setInitialData(data);
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
      await partesService.actualizarParte(id, data);
      navigate(`/ingresos/${id}`);
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  if (cargando) return <Loading />;
  if (error) return <Alert type="error">{error}</Alert>;

  return (
    <ParteProduccionForm
      tipo={initialData?.tipo_documento_id}
      initialData={initialData}
      onSubmit={handleSubmit}
    />
  );
}
