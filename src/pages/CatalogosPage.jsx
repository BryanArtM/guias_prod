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
import { mensajeDeError } from "@/services/errores";

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
      setError("Error al cargar los catálogos: " + mensajeDeError(err));
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

  // Los extremos son texto libre: un calibre valido puede ser "1000 - UP".
  const camposCalibre = [
    {
      name: "valor_minimo",
      label: "Valor Mínimo",
      type: "text",
      required: false,
      placeholder: "Ej: 1000",
    },
    {
      name: "valor_maximo",
      label: "Valor Máximo",
      type: "text",
      required: false,
      placeholder: "Ej: 2000 o UP",
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
      <div className="px-5 py-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      {/* Tabs */}
      <div className="border-b border-line mb-6">
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
                    : "border-transparent text-ink-muted hover:border-steel hover:text-ink"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido del catálogo activo */}
      <div className="border border-line bg-surface p-6 rounded-sm">{renderCatalogo()}</div>
    </div>
  );
}
