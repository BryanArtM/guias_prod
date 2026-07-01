import { useState, useEffect } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Modal, Alert, Select, Pagination } from "@/components/common";
import IngresoForm from "./IngresoForm";
import { Trash2, Plus, Filter } from "lucide-react";
import {
  obtenerIngresosPaginados,
  contarIngresos,
  crearIngreso,
  eliminarIngreso,
} from "@/services";
import { usePagination } from "@/hooks";

export default function IngresosList({
  especies = [],
  variantes = [],
  tiposIngreso = [],
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroVariante, setFiltroVariante] = useState("");

  // Control de items por página
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // OPTIMIZADO: Usar hook de paginación
  const pagination = usePagination(
    obtenerIngresosPaginados,
    contarIngresos,
    itemsPerPage,
  );

  const {
    data: ingresos,
    cargando,
    paginaActual,
    totalPaginas,
    totalItems,
    rangoActual,
    irAPagina,
    paginaSiguiente,
    paginaAnterior,
    hayPaginaAnterior,
    hayPaginaSiguiente,
    refrescar,
  } = pagination;

  // Aplicar filtros localmente
  const ingresosFiltrados = ingresos.filter((ingreso) => {
    if (filtroTipo && ingreso.tipo_ingreso_id !== parseInt(filtroTipo)) {
      return false;
    }
    if (filtroVariante && ingreso.variante_id !== parseInt(filtroVariante)) {
      return false;
    }
    return true;
  });

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const abrirModal = () => {
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const handleCrear = async (data) => {
    try {
      await crearIngreso(data);
      mostrarAlerta("Ingreso registrado exitosamente");
      cerrarModal();
      refrescar();
    } catch (error) {
      throw error;
    }
  };

  const handleEliminar = async (id, fecha) => {
    if (!window.confirm(`¿Estás seguro de eliminar el ingreso del ${fecha}?`)) {
      return;
    }

    try {
      await eliminarIngreso(id);
      mostrarAlerta("Ingreso eliminado exitosamente");
      refrescar();
    } catch (error) {
      mostrarAlerta("Error al eliminar ingreso: " + error.message, "error");
    }
  };

  const obtenerCodigoVariante = (varianteId) => {
    const variante = variantes.find((v) => v.variante_id === varianteId);
    return variante ? variante.codigo_completo : `ID: ${varianteId}`;
  };

  const obtenerNombreTipo = (tipoId) => {
    const tipo = tiposIngreso.find((t) => t.id === tipoId);
    return tipo ? tipo.codigo : "-";
  };

  const limpiarFiltros = () => {
    setFiltroTipo("");
    setFiltroVariante("");
  };

  const hayFiltrosActivos = filtroTipo || filtroVariante;

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
        <Alert type={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Registro de Ingresos
        </h2>
        <Button
          onClick={abrirModal}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Registrar Ingreso
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposIngreso.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.codigo}
                </option>
              ))}
            </Select>

            <Select
              label="Filtrar por Variante"
              value={filtroVariante}
              onChange={(e) => setFiltroVariante(e.target.value)}
            >
              <option value="">Todas las variantes</option>
              {variantes.map((variante) => (
                <option key={variante.variante_id} value={variante.variante_id}>
                  {variante.codigo_completo}
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
          {hayFiltrosActivos
            ? `Mostrando ${ingresosFiltrados.length} de ${ingresos.length} en esta página`
            : `Página ${paginaActual} de ${totalPaginas} - ${totalItems} total`}
        </p>
      </div>

      {/* Selector de items por página */}
      <div className="mb-4">
        <Select
          label="Elementos por página"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Select>
      </div>

      {ingresosFiltrados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {ingresos.length === 0
            ? "No hay ingresos registrados en esta página"
            : "No se encontraron ingresos con los filtros aplicados"}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Código Variante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Kg</TableHead>
                  <TableHead>Cajas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresosFiltrados.map((ingreso) => (
                  <TableRow key={ingreso.id}>
                    <TableCell>{ingreso.fecha}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-blue-700">
                        {obtenerCodigoVariante(ingreso.variante_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {obtenerNombreTipo(ingreso.tipo_ingreso_id)}
                      </span>
                    </TableCell>
                    <TableCell>{ingreso.kg.toFixed(2)}</TableCell>
                    <TableCell>{ingreso.cajas || "-"}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() =>
                          handleEliminar(ingreso.id, ingreso.fecha)
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* OPTIMIZADO: Componente de paginación */}
          <Pagination
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            rangoActual={rangoActual}
            onPaginaAnterior={paginaAnterior}
            onPaginaSiguiente={paginaSiguiente}
            onIrAPagina={irAPagina}
            hayPaginaAnterior={hayPaginaAnterior}
            hayPaginaSiguiente={hayPaginaSiguiente}
          />
        </>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title="Registrar Ingreso"
        size="large"
      >
        <IngresoForm
          onSubmit={handleCrear}
          onCancel={cerrarModal}
          especies={especies}
          variantes={variantes}
          tiposIngreso={tiposIngreso}
        />
      </Modal>
    </div>
  );
}
