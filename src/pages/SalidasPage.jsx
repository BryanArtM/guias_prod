import { useState, useEffect } from "react";
import SalidasList from "../components/salidas/SalidasList";
import { Loading } from "../components/common/Loading";
import { Alert } from "../components/common/Alert";
import { obtenerVariantesCompletas, obtenerTiposSalida } from "../services/api";

export default function SalidasPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [tiposSalida, setTiposSalida] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [variantesData, tiposData] = await Promise.all([
        obtenerVariantesCompletas(),
        obtenerTiposSalida(),
      ]);

      setVariantes(variantesData);
      setTiposSalida(tiposData);
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
      <SalidasList variantes={variantes} tiposSalida={tiposSalida} />
    </div>
  );
}
