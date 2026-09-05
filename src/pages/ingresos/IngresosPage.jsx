import { useState, useEffect } from "react";
import { IngresosList } from "@/components/ingresos";
import { Loading, Alert } from "@/components/common";
import { obtenerEspecies, obtenerTiposDocumentoProduccion } from "@/services";

export default function IngresosPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [especies, setEspecies] = useState([]);
  const [tiposDocumentoIngreso, setTiposDocumentoIngreso] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [especiesData, tiposData] = await Promise.all([
        obtenerEspecies(),
        obtenerTiposDocumentoProduccion(),
      ]);

      setEspecies(especiesData);
      setTiposDocumentoIngreso(tiposData);
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
      <div className="px-5 py-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <IngresosList
        especies={especies}
        tiposDocumentoIngreso={tiposDocumentoIngreso}
      />

    </div>
  );
}
