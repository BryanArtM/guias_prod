import { useMemo, useState, useCallback } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/common/Table";
import { Button, Alert, Select, Pagination } from "@/components/common";
import { Plus } from "lucide-react";
import { obtenerSalidasPaginadas, contarSalidas } from "@/services";
import { controlService } from "@/services";
import { usePagination } from "@/hooks";

export default function SalidasList({
  especies = [],
  tiposDocumentoSalida = [],
}) {
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
            {especies.map((especie) => (
              <option key={especie.id} value={especie.id}>
                {especie.nombre}
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {salidas.map((salida) => (
                  <TableRow key={salida.id} className="text-center uppercase">
                    <td className="font-mono text-sm text-blue-700">
                      {salida.numero_control}
                    </td>
                    <td>{salida.fecha}</td>
                    <td>{salida.cliente}</td>
                    <td>
                      <span className="inline-block px-2 py-1 text-xs text-red-800 rounded">
                        {salida.tipo_documento_codigo}
                      </span>
                    </td>
                    <td>{salida.especie_nombre}</td>
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
