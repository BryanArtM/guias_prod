import { useState, useEffect } from "react";
import VariantesList from "../components/variantes/VariantesList";
import { Loading } from "../components/common/Loading";
import { Alert } from "../components/common/Alert";
import {
  obtenerEspecies,
  obtenerFormasEnvasado,
  obtenerFormasEmpacado,
  obtenerCalidades,
  obtenerCalibres,
} from "../services/api";

export default function VariantesPage() {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Catálogos necesarios
  const [especies, setEspecies] = useState([]);
  const [formasEnvasado, setFormasEnvasado] = useState([]);
  const [formasEmpacado, setFormasEmpacado] = useState([]);
  const [calidades, setCalidades] = useState([]);
  const [calibres, setCalibres] = useState([]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [esp, fe, fem, cal, calib] = await Promise.all([
        obtenerEspecies(),
        obtenerFormasEnvasado(),
        obtenerFormasEmpacado(),
        obtenerCalidades(),
        obtenerCalibres(),
      ]);

      setEspecies(esp);
      setFormasEnvasado(fe);
      setFormasEmpacado(fem);
      setCalidades(cal);
      setCalibres(calib);
    } catch (err) {
      setError("Error al cargar los catálogos: " + err.message);
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
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </div>
    );
  }

  // Validar que existan catálogos necesarios
  const catalogosFaltantes = [];
  if (especies.length === 0) catalogosFaltantes.push("Especies");
  if (formasEnvasado.length === 0)
    catalogosFaltantes.push("Formas de Envasado");
  if (formasEmpacado.length === 0)
    catalogosFaltantes.push("Formas de Empacado");
  if (calidades.length === 0) catalogosFaltantes.push("Calidades");
  if (calibres.length === 0) catalogosFaltantes.push("Calibres");

  if (catalogosFaltantes.length > 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="warning">
          <div>
            <p className="font-semibold mb-2">
              Faltan catálogos necesarios para crear variantes:
            </p>
            <ul className="list-disc list-inside ml-4">
              {catalogosFaltantes.map((cat) => (
                <li key={cat}>{cat}</li>
              ))}
            </ul>
            <p className="mt-4">
              Por favor, crea al menos un registro en cada catálogo antes de
              crear variantes.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VariantesList
        especies={especies}
        formasEnvasado={formasEnvasado}
        formasEmpacado={formasEmpacado}
        calidades={calidades}
        calibres={calibres}
      />
    </div>
  );
}
