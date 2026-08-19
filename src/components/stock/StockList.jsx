import { useEffect, useMemo, useState } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Alert, Select, PageActions } from "@/components/common";
import { ChevronDown, ChevronRight, Download, RefreshCw } from "lucide-react";
import { obtenerStockActual, obtenerStockPorLote } from "@/services";
import { descargarCSV } from "@/components/reportes/shared";

// Un lote se considera antiguo a partir de estos dias, para avisar de rotacion
const DIAS_ALERTA_ANTIGUEDAD = 45;

function diasDesde(fechaIso) {
  const inicio = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return null;
  const hoy = new Date();
  return Math.floor((hoy - inicio) / 86400000);
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

const num = (valor, decimales = 2) => Number(valor || 0).toFixed(decimales);

export default function StockList() {
  const [stock, setStock] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);
  const [expandidas, setExpandidas] = useState(new Set());

  useEffect(() => {
    cargarStock();
  }, []);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  // El agregado trae todas las variantes (incluidas las que nunca tuvieron
  // movimiento); los lotes solo existen para las que si tuvieron ingresos.
  const cargarStock = async () => {
    setCargando(true);
    try {
      const [agregado, porLote] = await Promise.all([
        obtenerStockActual(),
        obtenerStockPorLote(),
      ]);
      setStock(agregado || []);
      setLotes(porLote || []);
    } catch (error) {
      mostrarAlerta("Error al cargar stock: " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const lotesPorVariante = useMemo(() => {
    const mapa = new Map();
    for (const lote of lotes) {
      if (!mapa.has(lote.variante_id)) mapa.set(lote.variante_id, []);
      mapa.get(lote.variante_id).push(lote);
    }
    // Del mas antiguo al mas reciente: es el orden en que se debe despachar
    for (const lista of mapa.values()) {
      lista.sort((a, b) => a.fecha_ingreso.localeCompare(b.fecha_ingreso));
    }
    return mapa;
  }, [lotes]);

  const stockFiltrado = useMemo(() => {
    return stock.filter((item) => {
      if (filtroCodigo && !item.codigo_completo.includes(filtroCodigo)) {
        return false;
      }
      if (soloConStock && Number(item.stock_kg) <= 0) {
        return false;
      }
      return true;
    });
  }, [stock, filtroCodigo, soloConStock]);

  // Solo los lotes con existencias: los agotados no son parte del stock
  const lotesConStockDe = (varianteId) =>
    (lotesPorVariante.get(varianteId) ?? []).filter(
      (lote) => lote.stock_cajas > 0 || lote.stock_kg > 0,
    );

  const toggleFila = (varianteId) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(varianteId)) next.delete(varianteId);
      else next.add(varianteId);
      return next;
    });
  };

  const todasExpandidas =
    stockFiltrado.length > 0 &&
    stockFiltrado.every((item) => expandidas.has(item.variante_id));

  const toggleTodas = () => {
    setExpandidas(
      todasExpandidas
        ? new Set()
        : new Set(stockFiltrado.map((item) => item.variante_id)),
    );
  };

  // Se exporta el detalle por lote, que es el nivel util para inventario
  const exportarCSV = async () => {
    const headers = [
      "Variante",
      "Fecha Ingreso",
      "Dias",
      "Cajas Ingresadas",
      "Cajas Salidas",
      "Cajas Disponibles",
      "Kg Ingresados",
      "Kg Salidos",
      "Kg Disponibles",
    ];
    const filas = [];
    for (const item of stockFiltrado) {
      const suyos = lotesConStockDe(item.variante_id);
      if (suyos.length === 0) {
        filas.push([
          item.codigo_completo,
          "sin lotes",
          "",
          0,
          0,
          item.stock_cajas,
          0,
          0,
          num(item.stock_kg),
        ]);
        continue;
      }
      for (const lote of suyos) {
        filas.push([
          item.codigo_completo,
          lote.fecha_ingreso,
          diasDesde(lote.fecha_ingreso) ?? "",
          lote.ingresos_cajas,
          lote.salidas_cajas,
          lote.stock_cajas,
          num(lote.ingresos_kg),
          num(lote.salidas_kg),
          num(lote.stock_kg),
        ]);
      }
    }

    try {
      const ruta = await descargarCSV("stock_lotes", headers, filas);
      mostrarAlerta(`Archivo guardado en ${ruta}`);
    } catch (e) {
      mostrarAlerta(`No se pudo exportar: ${e.message || e}`, "error");
    }
  };

  if (cargando) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalLotes = stockFiltrado.reduce(
    (total, item) => total + lotesConStockDe(item.variante_id).length,
    0,
  );

  return (
    <div>
      {alerta && (
        <Alert type={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      <PageActions>
        <Button variant="ghost" size="sm" onClick={toggleTodas}>
          {todasExpandidas ? "Contraer todo" : "Expandir todo"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={cargarStock}
          icon={<RefreshCw />}
          iconPosition="left"
        >
          Actualizar
        </Button>
        <Button
          size="sm"
          onClick={exportarCSV}
          icon={<Download />}
          iconPosition="left"
        >
          Exportar CSV
        </Button>
      </PageActions>

      <div className="border border-line bg-surface p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filtrar por código"
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          >
            <option value="">Todos</option>
            {[
              ...new Set(
                stock.map((item) => item.codigo_completo.split(" ")[0]),
              ),
            ]
              .filter(Boolean)
              .sort()
              .map((codigo) => (
                <option key={codigo} value={codigo}>
                  {codigo}
                </option>
              ))}
          </Select>

          <div className="flex items-center pt-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soloConStock}
                onChange={(e) => setSoloConStock(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Solo con stock &gt; 0
              </span>
            </label>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Mostrando {stockFiltrado.length} de {stock.length} variantes ·{" "}
          {totalLotes} lote{totalLotes === 1 ? "" : "s"} con existencias
        </p>
      </div>

      {stockFiltrado.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay variantes con stock disponible
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Código Variante</TableHead>
              <TableHead className="text-center">Lotes</TableHead>
              <TableHead>Lote más antiguo</TableHead>
              <TableHead className="text-right">Kg Stock</TableHead>
              <TableHead className="text-right">Cajas Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockFiltrado.map((item) => {
              const suyos = lotesConStockDe(item.variante_id);
              const abierta = expandidas.has(item.variante_id);
              const masAntiguo = suyos[0];
              const dias = masAntiguo ? diasDesde(masAntiguo.fecha_ingreso) : null;
              const esAntiguo = dias != null && dias >= DIAS_ALERTA_ANTIGUEDAD;

              return [
                <TableRow
                  key={item.variante_id}
                  className="cursor-pointer"
                  onClick={() => toggleFila(item.variante_id)}
                >
                  <TableCell className="text-center text-gray-500">
                    {suyos.length > 0 &&
                      (abierta ? (
                        <ChevronDown className="w-4 h-4 inline" />
                      ) : (
                        <ChevronRight className="w-4 h-4 inline" />
                      ))}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-semibold text-blue-700">
                      {item.codigo_completo}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {suyos.length > 0 ? (
                      suyos.length
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {masAntiguo ? (
                      <span
                        className={
                          esAntiguo ? "text-amber-700 font-medium" : undefined
                        }
                        title={
                          esAntiguo
                            ? "Lote con mucha antigüedad, conviene rotarlo"
                            : undefined
                        }
                      >
                        {formatearFecha(masAntiguo.fecha_ingreso)}
                        {dias != null && (
                          <span className="text-xs text-gray-500">
                            {" "}
                            ({dias} d)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-sm">
                        Sin movimiento
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {num(item.stock_kg)}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.stock_cajas || 0)}
                  </TableCell>
                </TableRow>,

                abierta && suyos.length > 0 && (
                  <TableRow key={`${item.variante_id}-detalle`}>
                    <TableCell colSpan={6} className="bg-gray-50 p-0">
                      <div className="px-6 py-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Detalle por lote (del más antiguo al más reciente)
                        </p>
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="text-xs uppercase text-gray-500">
                              <th className="p-2 border text-left">
                                Fecha Ingreso
                              </th>
                              <th className="p-2 border text-right">
                                Antigüedad
                              </th>
                              <th className="p-2 border text-right">
                                Ingresado
                              </th>
                              <th className="p-2 border text-right">Salido</th>
                              <th className="p-2 border text-right">
                                Disponible
                              </th>
                              <th className="p-2 border text-right">
                                Peso Und.
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {suyos.map((lote) => {
                              const d = diasDesde(lote.fecha_ingreso);
                              const viejo =
                                d != null && d >= DIAS_ALERTA_ANTIGUEDAD;
                              return (
                                <tr
                                  key={lote.fecha_ingreso}
                                  className="bg-surface"
                                >
                                  <td className="p-2 border font-medium">
                                    {formatearFecha(lote.fecha_ingreso)}
                                  </td>
                                  <td
                                    className={`p-2 border text-right ${
                                      viejo ? "text-amber-700 font-medium" : ""
                                    }`}
                                  >
                                    {d != null ? `${d} días` : "-"}
                                  </td>
                                  <td className="p-2 border text-right text-gray-600">
                                    {lote.ingresos_cajas} cajas
                                    <br />
                                    <span className="text-xs">
                                      {num(lote.ingresos_kg)} kg
                                    </span>
                                  </td>
                                  <td className="p-2 border text-right text-gray-600">
                                    {lote.salidas_cajas} cajas
                                    <br />
                                    <span className="text-xs">
                                      {num(lote.salidas_kg)} kg
                                    </span>
                                  </td>
                                  <td className="p-2 border text-right font-semibold text-blue-700">
                                    {lote.stock_cajas} cajas
                                    <br />
                                    <span className="text-xs">
                                      {num(lote.stock_kg)} kg
                                    </span>
                                  </td>
                                  <td className="p-2 border text-right text-gray-600">
                                    {num(lote.peso_unidad)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              ];
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
