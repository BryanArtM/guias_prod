import { useState, useEffect } from "react";
import { SalidasList, ImportMasivoSalidas } from "@/components/salidas";
import { Loading, Alert, Button, Modal } from "@/components/common";
import { obtenerVariantesCompletas, obtenerTiposSalida } from "@/services";
import { Upload } from "lucide-react";

export default function SalidasPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [tiposSalida, setTiposSalida] = useState([]);
  const [mostrarImport, setMostrarImport] = useState(false); // NUEVO: Modal de importación

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

  const handleImportSuccess = () => {
    setMostrarImport(false);
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
        <Button
          onClick={() => setMostrarImport(true)}
          variant="secondary"
          icon={<Upload className="w-4 h-4" />}
          iconPosition="left"
        >
          Importar CSV
        </Button>
      </div>

      <SalidasList variantes={variantes} tiposSalida={tiposSalida} />

      <Modal
        isOpen={mostrarImport}
        onClose={() => setMostrarImport(false)}
        title="Importación Masiva de Salidas"
        size="large"
      >
        <ImportMasivoSalidas onSuccess={handleImportSuccess} />
      </Modal>
    </div>
  );
}
