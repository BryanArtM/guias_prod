import { useState, useEffect } from "react";
import { IngresosList, ImportMasivoIngresos } from "@/components/ingresos";
import { Loading, Alert, Button, Modal } from "@/components/common";
import { obtenerVariantesCompletas, obtenerTiposIngreso } from "@/services";
import { Upload } from "lucide-react";

export default function IngresosPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [tiposIngreso, setTiposIngreso] = useState([]);
  const [mostrarImport, setMostrarImport] = useState(false);

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
      {/* NUEVO: Botón de importación masiva */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingresos</h1>
        <Button
          onClick={() => setMostrarImport(true)}
          variant="secondary"
          icon={<Upload className="w-4 h-4" />}
          iconPosition="left"
        >
          Importar CSV
        </Button>
      </div>

      <IngresosList variantes={variantes} tiposIngreso={tiposIngreso} />

      <Modal
        isOpen={mostrarImport}
        onClose={() => setMostrarImport(false)}
        title="Importación Masiva de Ingresos"
        size="large"
      >
        <ImportMasivoIngresos onSuccess={handleImportSuccess} />
      </Modal>
    </div>
  );
}
