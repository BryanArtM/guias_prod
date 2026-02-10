import { useState, useEffect } from "react";
import { PresentacionesList } from "@/components/presentaciones";
import { obtenerEspecies } from "@/services";
import { Loading, Alert } from "@/components/common";

export function PresentacionesPage() {
  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEspecies();
  }, []);

  const cargarEspecies = async () => {
    try {
      setLoading(true);
      const data = await obtenerEspecies();
      setEspecies(data);
      setError("");
    } catch (err) {
      setError("Error al cargar especies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Loading message="Cargando datos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (especies.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert
          type="warning"
          message="No hay especies registradas. Por favor, crea primero una especie antes de agregar presentaciones."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PresentacionesList especies={especies} />
    </div>
  );
}
