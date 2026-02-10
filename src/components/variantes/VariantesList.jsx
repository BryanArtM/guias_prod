import { useState, useEffect } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Modal, Alert, Select } from "@/components/common";
import VarianteForm from "./VarianteForm";
import { Edit2, Trash2, Plus, Filter } from "lucide-react";
import {
  obtenerVariantesCompletas,
  crearVariantePresentacion,
  actualizarVariantePresentacion,
  eliminarVariantePresentacion,
} from "@/services";

export default function VariantesList({
  especies = [],
  formasEnvasado = [],
  formasEmpacado = [],
  calidades = [],
  calibres = [],
}) {
  const [variantes, setVariantes] = useState([]);
  const [variantesFiltradas, setVariantesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [varianteEditando, setVarianteEditando] = useState(null);
  const [alerta, setAlerta] = useState(null);

  // Filtros
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [filtroPresentacion, setFiltroPresentacion] = useState("");
  const [presentacionesFiltro, setPresentacionesFiltro] = useState([]);

  // Debug: Log props recibidos
  useEffect(() => {}, [
    especies,
    formasEnvasado,
    formasEmpacado,
    calidades,
    calibres,
  ]);

  useEffect(() => {
    cargarVariantes();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...variantes];

    if (filtroEspecie) {
      resultado = resultado.filter(
        (v) => v.especie_id === parseInt(filtroEspecie),
      );
    }

    if (filtroPresentacion) {
      resultado = resultado.filter(
        (v) => v.presentacion_id === parseInt(filtroPresentacion),
      );
    }

    setVariantesFiltradas(resultado);
  }, [variantes, filtroEspecie, filtroPresentacion]);

  // Cargar presentaciones cuando cambia filtro especie
  useEffect(() => {
    const cargarPresentaciones = async () => {
      if (!filtroEspecie) {
        setPresentacionesFiltro([]);
        setFiltroPresentacion("");
        return;
      }

      try {
        const { obtenerPresentacionesPorEspecie } =
          await import("../../services/api");
        const data = await obtenerPresentacionesPorEspecie(
          parseInt(filtroEspecie),
        );
        setPresentacionesFiltro(data);
      } catch (error) {
        console.error("Error al cargar presentaciones:", error);
        setPresentacionesFiltro([]);
      }
    };

    cargarPresentaciones();
  }, [filtroEspecie]);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const cargarVariantes = async () => {
    setCargando(true);
    try {
      const data = await obtenerVariantesCompletas();
      setVariantes(data);
    } catch (error) {
      mostrarAlerta("Error al cargar variantes: " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (variante = null) => {
    setVarianteEditando(variante);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setVarianteEditando(null);
  };

  const handleCrear = async (data) => {
    try {
      await crearVariantePresentacion(data);
      mostrarAlerta("Variante creada exitosamente");
      cerrarModal();
      cargarVariantes();
    } catch (error) {
      throw error;
    }
  };

  const handleActualizar = async (data) => {
    try {
      await actualizarVariantePresentacion(varianteEditando.variante_id, data);
      mostrarAlerta("Variante actualizada exitosamente");
      cerrarModal();
      cargarVariantes();
    } catch (error) {
      throw error;
    }
  };

  const handleEliminar = async (id, codigo) => {
    if (!window.confirm(`¿Estás seguro de eliminar la variante "${codigo}"?`)) {
      return;
    }

    try {
      await eliminarVariantePresentacion(id);
      mostrarAlerta("Variante eliminada exitosamente");
      cargarVariantes();
    } catch (error) {
      mostrarAlerta("Error al eliminar variante: " + error.message, "error");
    }
  };

  const limpiarFiltros = () => {
    setFiltroEspecie("");
    setFiltroPresentacion("");
  };

  const hayFiltrosActivos = filtroEspecie || filtroPresentacion;

  if (cargando) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {alerta && (
        <Alert variant={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      {/* Mensaje de advertencia si faltan catálogos */}
      {(especies.length === 0 ||
        formasEnvasado.length === 0 ||
        formasEmpacado.length === 0 ||
        calidades.length === 0 ||
        calibres.length === 0) && (
        <Alert variant="warning" className="mb-4">
          <div>
            <p className="font-semibold mb-2">Algunos catálogos están vacíos</p>
            <p className="text-sm">
              Para crear variantes necesitas tener datos en todos los catálogos.
              Faltan:{" "}
              {[
                especies.length === 0 && "Especies",
                formasEnvasado.length === 0 && "Formas de Envasado",
                formasEmpacado.length === 0 && "Formas de Empacado",
                calidades.length === 0 && "Calidades",
                calibres.length === 0 && "Calibres",
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Variantes de Presentaciones
        </h2>
        <Button
          onClick={() => abrirModal()}
          disabled={
            especies.length === 0 ||
            formasEnvasado.length === 0 ||
            formasEmpacado.length === 0 ||
            calidades.length === 0 ||
            calibres.length === 0
          }
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Crear Variante
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por Especie"
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
            >
              <option value="">Todas las especies</option>
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nombre}
                </option>
              ))}
            </Select>

            <Select
              label="Filtrar por Presentación"
              value={filtroPresentacion}
              onChange={(e) => setFiltroPresentacion(e.target.value)}
              disabled={!filtroEspecie}
            >
              <option value="">
                {filtroEspecie
                  ? "Todas las presentaciones"
                  : "Primero seleccione especie"}
              </option>
              {presentacionesFiltro.map((presentacion) => (
                <option key={presentacion.id} value={presentacion.id}>
                  {presentacion.nombre}
                </option>
              ))}
            </Select>
          </div>

          {hayFiltrosActivos && (
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Mostrando {variantesFiltradas.length} de {variantes.length} variantes
        </p>
      </div>

      {variantesFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {variantes.length === 0
            ? "No hay variantes registradas"
            : "No se encontraron variantes con los filtros aplicados"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Código Completo</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Presentación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantesFiltradas.map((variante) => (
              <TableRow key={variante.variante_id}>
                <TableCell>{variante.variante_id}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-semibold text-blue-700">
                    {variante.codigo_completo}
                  </span>
                </TableCell>
                <TableCell>{variante.especie_nombre}</TableCell>
                <TableCell>{variante.presentacion_nombre}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-5">
                    <button
                      onClick={() => abrirModal(variante)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        handleEliminar(
                          variante.variante_id,
                          variante.codigo_completo,
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={`${varianteEditando ? "Editar" : "Crear"} Variante`}
        size="large"
      >
        <VarianteForm
          onSubmit={varianteEditando ? handleActualizar : handleCrear}
          onCancel={cerrarModal}
          varianteInicial={varianteEditando}
          especies={especies}
          formasEnvasado={formasEnvasado}
          formasEmpacado={formasEmpacado}
          calidades={calidades}
          calibres={calibres}
        />
      </Modal>
    </div>
  );
}
