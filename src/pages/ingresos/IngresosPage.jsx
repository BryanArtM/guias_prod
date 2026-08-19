import { useState, useEffect } from "react";
import { IngresosList } from "@/components/ingresos";
import { Loading, Alert } from "@/components/common";
import {
  obtenerEspecies,
  obtenerVariantesCompletas,
  obtenerTiposDocumentoProduccion,
} from "@/services";

export default function IngresosPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [especies, setEspecies] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [tiposDocumentoIngreso, setTiposDocumentoIngreso] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [especiesData, variantesData, tiposData] = await Promise.all([
        obtenerEspecies(),
        obtenerVariantesCompletas(),
        obtenerTiposDocumentoProduccion(),
      ]);

      setEspecies(especiesData);
      setVariantes(variantesData);
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
        variantes={variantes}
        tiposDocumentoIngreso={tiposDocumentoIngreso}
      />

    </div>
  );
}
