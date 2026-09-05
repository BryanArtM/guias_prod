import { useState, useEffect } from "react";
import { SalidasList } from "@/components/salidas";
import { Loading, Alert } from "@/components/common";
import { obtenerTiposDocumentoSalida, obtenerEspecies } from "@/services";

export default function SalidasPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [especies, setEspecies] = useState([]);
  const [tiposDocumentoSalida, setTiposDocumentoSalida] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [especiesData, tiposData] = await Promise.all([
        obtenerEspecies(),
        obtenerTiposDocumentoSalida(),
      ]);

      setEspecies(especiesData);
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
        tiposDocumentoSalida={tiposDocumentoSalida}
      />
    </div>
  );
}
