import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loading, Alert } from "@/components/common";
import ParteProduccionForm from "@/components/partes/ParteProduccionForm";
import { partesService } from "@/services";
import { mensajeDeError } from "@/services/errores";

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
        setError(mensajeDeError(err));
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  // Un fallo al guardar se propaga al formulario, que lo muestra en su alerta
  // sin sacar al usuario de la vista ni perder lo que llevaba escrito.
  const handleSubmit = async (data) => {
    await partesService.actualizarParte(id, data);
    navigate(`/ingresos/${id}`);
  };

  if (cargando) return <Loading />;
  if (error) return <Alert variant="error">{error}</Alert>;

  return (
    <ParteProduccionForm
      tipo={initialData?.tipo_documento_id}
      initialData={initialData}
      onSubmit={handleSubmit}
      onCancel={() => navigate(`/ingresos/${id}`)}
    />
  );
}
