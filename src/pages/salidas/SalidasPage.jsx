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
      <div className="px-5 py-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <SalidasList
        especies={especies}
        variantes={variantes}
        tiposDocumentoSalida={tiposDocumentoSalida}
      />
    </div>
  );
}
