import { useState, useEffect } from "react";
import { IngresosList } from "@/components/ingresos";
import { Loading, Alert } from "@/components/common";
import { obtenerVariantesCompletas, obtenerTiposIngreso } from "@/services";

export default function IngresosPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [tiposIngreso, setTiposIngreso] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [variantesData, tiposData] = await Promise.all([
        obtenerVariantesCompletas(),
        obtenerTiposIngreso(),
      ]);

      setVariantes(variantesData);
      setTiposIngreso(tiposData);
    } catch (err) {
      setError("Error al cargar los datos: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <IngresosList variantes={variantes} tiposIngreso={tiposIngreso} />
    </div>
  );
}
