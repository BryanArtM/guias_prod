import { useState, useEffect } from "react";
import { CatalogoManager } from "@/components/catalogos";
import { Loading, Alert } from "@/components/common";
import {
  obtenerFormasEnvasado,
  crearFormaEnvasado,
  actualizarFormaEnvasado,
  eliminarFormaEnvasado,
  obtenerFormasEmpacado,
  crearFormaEmpacado,
  actualizarFormaEmpacado,
  eliminarFormaEmpacado,
  obtenerCalidades,
  crearCalidad,
  actualizarCalidad,
  eliminarCalidad,
  obtenerCalibres,
  crearCalibre,
  actualizarCalibre,
  eliminarCalibre,
} from "@/services";

export default function CatalogosPage() {
  const [tabActiva, setTabActiva] = useState("formasEnvasado");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para cada catálogo
  const [formasEnvasado, setFormasEnvasado] = useState([]);
  const [formasEmpacado, setFormasEmpacado] = useState([]);
  const [calidades, setCalidades] = useState([]);
  const [calibres, setCalibres] = useState([]);

  useEffect(() => {
    cargarTodosCatalogos();
  }, []);

  const cargarTodosCatalogos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [fe, fem, cal, calib] = await Promise.all([
        obtenerFormasEnvasado(),
        obtenerFormasEmpacado(),
        obtenerCalidades(),
        obtenerCalibres(),
      ]);

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

  const tabs = [
    { id: "formasEnvasado", label: "Formas de Envasado" },
    { id: "formasEmpacado", label: "Formas de Empacado" },
    { id: "calidades", label: "Calidades" },
    { id: "calibres", label: "Calibres" },
  ];

  const camposSimples = [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    {
      name: "descripcion",
      label: "Descripción",
      type: "text",
      required: false,
    },
  ];

  const camposCalibre = [
    {
      name: "valor_minimo",
      label: "Valor Mínimo",
      type: "number",
      required: false,
      step: "1",
      min: "0",
    },
    {
      name: "valor_maximo",
      label: "Valor Máximo",
      type: "number",
      required: false,
      step: "1",
      min: "0",
    },
  ];

  const renderCatalogo = () => {
    switch (tabActiva) {
      case "formasEnvasado":
        return (
          <CatalogoManager
            titulo="Forma de Envasado"
            datos={formasEnvasado}
            campos={camposSimples}
            onCrear={crearFormaEnvasado}
            onActualizar={actualizarFormaEnvasado}
            onEliminar={eliminarFormaEnvasado}
            onRecargar={() => obtenerFormasEnvasado().then(setFormasEnvasado)}
          />
        );

      case "formasEmpacado":
        return (
          <CatalogoManager
            titulo="Forma de Empacado"
            datos={formasEmpacado}
            campos={camposSimples}
            onCrear={crearFormaEmpacado}
            onActualizar={actualizarFormaEmpacado}
            onEliminar={eliminarFormaEmpacado}
            onRecargar={() => obtenerFormasEmpacado().then(setFormasEmpacado)}
          />
        );

      case "calidades":
        return (
          <CatalogoManager
            titulo="Calidad"
            datos={calidades}
            campos={camposSimples}
            onCrear={crearCalidad}
            onActualizar={actualizarCalidad}
            onEliminar={eliminarCalidad}
            onRecargar={() => obtenerCalidades().then(setCalidades)}
          />
        );

      case "calibres":
        return (
          <CatalogoManager
            titulo="Calibre"
            datos={calibres}
            campos={camposCalibre}
            onCrear={crearCalibre}
            onActualizar={actualizarCalibre}
            onEliminar={eliminarCalibre}
            onRecargar={() => obtenerCalibres().then(setCalibres)}
          />
        );

      default:
        return null;
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Gestión de Catálogos
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`
                py-2 px-4 border-b-2 font-medium text-sm
                ${
                  tabActiva === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del catálogo activo */}
      <div className="bg-white rounded-lg shadow p-6">{renderCatalogo()}</div>
    </div>
  );
}
