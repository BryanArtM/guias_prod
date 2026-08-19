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
      <div className="px-5 py-4">
        <Loading message="Cargando datos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-5 py-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (especies.length === 0) {
    return (
      <div className="px-5 py-4">
        <Alert variant="warning">
          No hay especies registradas. Por favor, crea primero una especie antes
          de agregar presentaciones.
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <PresentacionesList especies={especies} />
    </div>
  );
}
