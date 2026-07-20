import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Alert, Select, Pagination } from "@/components/common";
import { Trash2, Filter, Pencil, Eye } from "lucide-react";
import { obtenerSalidasPaginadas, contarSalidas } from "@/services";
import { controlService } from "@/services";
import { usePagination } from "@/hooks";
import PrintButtonSalida from "@/components/salidas/ImpresionControlSalida";

export default function SalidasList({
  especies = [],
  tiposDocumentoSalida = [],
}) {
  const navigate = useNavigate();
  const [alerta, setAlerta] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const tipoId = filtroTipo ? parseInt(filtroTipo, 10) : null;
  const especieId = filtroEspecie ? parseInt(filtroEspecie, 10) : null;

  const fetchSalidas = useCallback(
    (limite, offset) =>
      obtenerSalidasPaginadas(limite, offset, tipoId, especieId),
    [tipoId, especieId],
  );
  const countSalidas = useCallback(
    () => contarSalidas(tipoId, especieId),
    [tipoId, especieId],
  );

  const pagination = usePagination(fetchSalidas, countSalidas, itemsPerPage);

  const {
    data: salidas,
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

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const handleEliminar = async (id, fecha) => {
    if (!window.confirm(`¿Estás seguro de eliminar la salida del ${fecha}?`))
      return;
    try {
      await controlService.eliminarControlSalida(id);
      mostrarAlerta("Salida eliminada exitosamente");
      refrescar();
    } catch (error) {
      mostrarAlerta("Error al eliminar salida: " + error.message, "error");
    }
  };

  const limpiarFiltros = () => {
    setFiltroTipo("");
    setFiltroEspecie("");
  };
  const hayFiltrosActivos = filtroTipo || filtroEspecie;

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

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposDocumentoSalida.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.codigo}
                </option>
              ))}
            </Select>

            <Select
              label="Filtrar por especie"
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
          </div>
          {hayFiltrosActivos && (
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {`Página ${paginaActual} de ${totalPaginas} - ${totalItems} total`}
        </p>
      </div>

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

      {salidas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {hayFiltrosActivos
            ? "No se encontraron salidas con los filtros aplicados"
            : "No hay controles de salida registrados"}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Control</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salidas.map((salida) => (
                  <TableRow key={salida.id} className="text-center uppercase">
                    <TableCell className="font-mono text-sm text-blue-700">
                      {salida.numero_control}
                    </TableCell>
                    <TableCell>{salida.fecha}</TableCell>
                    <TableCell>{salida.cliente}</TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 text-xs text-red-800 rounded">
                        {salida.tipo_documento_codigo}
                      </span>
                    </TableCell>
                    <TableCell>{salida.especie_nombre}</TableCell>
                    <TableCell className="text-center gap-5 flex justify-center">
                      <button
                        onClick={() => navigate(`/salidas/${salida.id}`)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/salidas/${salida.id}/editar`)}
                        className="text-green-600 hover:text-green-800 mr-2"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(salida.id, salida.fecha)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <PrintButtonSalida salidaId={salida.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
    </div>
  );
}
