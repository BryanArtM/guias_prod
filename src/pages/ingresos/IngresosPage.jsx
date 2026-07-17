import { useState, useEffect } from "react";
import { IngresosList } from "@/components/ingresos";
import { Loading, Alert, Button } from "@/components/common";
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
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* NUEVO: Botón de importación masiva */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingresos</h1>

      </div>

      <IngresosList
        especies={especies}
        variantes={variantes}
        tiposDocumentoIngreso={tiposDocumentoIngreso}
      />

    </div>
  );
}
