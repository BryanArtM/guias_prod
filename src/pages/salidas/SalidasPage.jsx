import { useState, useEffect } from "react";
import { SalidasList } from "@/components/salidas";
import { Loading, Alert } from "@/components/common";
import {
  obtenerVariantesCompletas,
  obtenerTiposDocumentoSalida,
  obtenerEspecies,
} from "@/services";

export default function SalidasPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [tiposDocumentoSalida, setTiposDocumentoSalida] = useState([]);

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
        obtenerTiposDocumentoSalida(),
      ]);

      setEspecies(especiesData);
      setVariantes(variantesData);
      setTiposDocumentoSalida(tiposData);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Salidas</h1>
      </div>

      <SalidasList
        especies={especies}
        variantes={variantes}
        tiposDocumentoSalida={tiposDocumentoSalida}
      />
    </div>
  );
}
