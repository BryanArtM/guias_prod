import { useMemo, useState } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/common/Table";
import { Button, Modal, Alert, Select, Pagination } from "@/components/common";
import { Plus } from "lucide-react";
import { obtenerSalidasPaginadas, contarSalidas } from "@/services";
import { controlService } from "@/services";
import { usePagination } from "@/hooks";

export default function SalidasList({
  variantes = [],
  tiposDocumentoSalida = [],
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const pagination = usePagination(
    obtenerSalidasPaginadas,
    contarSalidas,
    itemsPerPage,
  );

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

  const salidasFiltradas = useMemo(() => {
    return salidas.filter((salida) => {
      if (filtroTipo && salida.tipo_documento_id !== parseInt(filtroTipo, 10)) {
        return false;
      }
      if (filtroEspecie && salida.especie_id !== parseInt(filtroEspecie, 10)) {
        return false;
      }
      return true;
    });
  }, [salidas, filtroTipo, filtroEspecie]);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const abrirModal = () => setModalAbierto(true);
  const cerrarModal = () => setModalAbierto(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {[
              ...new Map(
                salidas.map((s) => [s.especie_id, s.especie_nombre]),
              ).entries(),
            ].map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </Select>
        </div>

        {hayFiltrosActivos && (
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-600 mt-2">
          {hayFiltrosActivos
            ? `Mostrando ${salidasFiltradas.length} de ${salidas.length} en esta página`
            : `Página ${paginaActual} de ${totalPaginas} - ${totalItems} total`}
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

      {salidasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay controles de salida registrados
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
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Kg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salidasFiltradas.map((salida) => (
                  <TableRow key={salida.id}>
                    <td className="font-mono text-sm text-blue-700">
                      {salida.numero_control}
                    </td>
                    <td>{salida.fecha}</td>
                    <td>{salida.cliente}</td>
                    <td>
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        {salida.tipo_documento_codigo}
                      </span>
                    </td>
                    <td>{salida.especie_nombre}</td>
                    <td className="text-right">{salida.suma_cantidad}</td>
                    <td className="text-right">
                      {Number(salida.suma_total_kg || 0).toFixed(2)}
                    </td>
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
