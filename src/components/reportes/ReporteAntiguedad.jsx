import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button } from "@/components/common";
import { Download } from "lucide-react";
import { obtenerStockPorLote } from "@/services";
import {
  TableModular,
  TableHeader,
  TableHead,
} from "@/components/common/Table";
import {
  BarrasHorizontales,
  Cargando,
  EncabezadoReporte,
  Indicador,
  PanelVacio,
  descargarCSV,
  diasDesde,
  formatearEntero,
  formatearFecha,
  formatearNumero,
} from "./shared";

// Tramos de antiguedad. El estado va de conforme a critico para que el panorama
// se lea de un vistazo, usando los colores semanticos del sistema.
const TRAMOS = [
  { etiqueta: "0 a 15 días", min: 0, max: 15, estado: "ok" },
  { etiqueta: "16 a 30 días", min: 16, max: 30, estado: "neutral" },
  { etiqueta: "31 a 45 días", min: 31, max: 45, estado: "neutral" },
  { etiqueta: "46 a 60 días", min: 46, max: 60, estado: "warn" },
  { etiqueta: "Más de 60 días", min: 61, max: Infinity, estado: "crit" },
];

// Muestra de color de la leyenda, alineada al estado del tramo
const MUESTRA_POR_ESTADO = {
  ok: "bg-ok",
  neutral: "bg-steel",
  warn: "bg-warn-line",
  crit: "bg-crit",
};

const tramoDe = (dias) =>
  TRAMOS.find((t) => dias >= t.min && dias <= t.max) ?? TRAMOS[TRAMOS.length - 1];

export default function ReporteAntiguedad({ especieId }) {
  const [lotes, setLotes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [avisoExport, setAvisoExport] = useState(null);

  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerStockPorLote();
        if (vigente) setLotes(data || []);
      } catch (e) {
        if (vigente) setError(e.message || String(e));
      } finally {
        if (vigente) setCargando(false);
      }
    };
    cargar();
    return () => {
      vigente = false;
    };
  }, []);

  const conStock = useMemo(() => {
    return lotes
      .filter((l) => l.stock_cajas > 0 || l.stock_kg > 0)
      .filter((l) => !especieId || l.especie_id === Number(especieId))
      .map((l) => ({ ...l, dias: diasDesde(l.fecha_ingreso) ?? 0 }))
      .sort((a, b) => b.dias - a.dias);
  }, [lotes, especieId]);

  const resumen = useMemo(() => {
    const porTramo = TRAMOS.map((tramo) => ({
      ...tramo,
      lotes: 0,
      cajas: 0,
      kg: 0,
    }));
    for (const lote of conStock) {
      const indice = TRAMOS.indexOf(tramoDe(lote.dias));
      porTramo[indice].lotes += 1;
      porTramo[indice].cajas += lote.stock_cajas;
      porTramo[indice].kg += lote.stock_kg;
    }
    return porTramo;
  }, [conStock]);

  const totalKg = conStock.reduce((t, l) => t + l.stock_kg, 0);
  const totalCajas = conStock.reduce((t, l) => t + l.stock_cajas, 0);
  const kgEnRiesgo = resumen
    .filter((t) => t.min >= 46)
    .reduce((total, t) => total + t.kg, 0);
  const masAntiguo = conStock[0];
  const diasPromedio =
    totalKg > 0
      ? conStock.reduce((t, l) => t + l.dias * l.stock_kg, 0) / totalKg
      : 0;

  const exportar = async () => {
    try {
      const ruta = await descargarCSV(
        "antiguedad_inventario",
        ["Variante", "Fecha Ingreso", "Dias", "Tramo", "Cajas", "Kg"],
        conStock.map((l) => [
          l.codigo_completo,
          l.fecha_ingreso,
          l.dias,
          tramoDe(l.dias).etiqueta,
          l.stock_cajas,
          Number(l.stock_kg).toFixed(2),
        ]),
      );
      setAvisoExport(`Archivo guardado en ${ruta}`);
    } catch (e) {
      setAvisoExport(`No se pudo exportar: ${e.message || e}`);
    }
  };

  if (cargando) return <Cargando />;
  if (error) {
    return (
      <Alert variant="error">{error}</Alert>
    );
  }
  if (conStock.length === 0) {
    return <PanelVacio mensaje="No hay lotes con existencias" />;
  }

  return (
    <div>
      <EncabezadoReporte
        titulo="Antigüedad del inventario"
        descripcion="Distribución de las existencias según el tiempo que llevan almacenadas, contado desde la fecha de producción del lote. Permite detectar mercadería que conviene rotar."
        acciones={
          <Button
            variant="secondary"
            onClick={exportar}
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
          >
            CSV
          </Button>
        }
      />

      {avisoExport && (
        <div className="mb-4 border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 flex items-start justify-between gap-4">
          <span className="break-all">{avisoExport}</span>
          <button
            type="button"
            onClick={() => setAvisoExport(null)}
            className="text-blue-700 hover:text-blue-900 shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Indicador
          etiqueta="Existencias"
          valor={`${formatearNumero(totalKg)} kg`}
          detalle={`${formatearEntero(totalCajas)} cajas en ${conStock.length} lotes`}
        />
        <Indicador
          etiqueta="Antigüedad promedio"
          valor={`${formatearNumero(diasPromedio, 0)} días`}
          detalle="Ponderada por kilos"
        />
        <Indicador
          etiqueta="Más de 45 días"
          valor={`${formatearNumero(kgEnRiesgo)} kg`}
          detalle={
            totalKg > 0
              ? `${formatearNumero((kgEnRiesgo / totalKg) * 100, 1)} % del total`
              : undefined
          }
          tono={kgEnRiesgo > 0 ? "alerta" : "neutro"}
        />
        <Indicador
          etiqueta="Lote más antiguo"
          valor={`${masAntiguo.dias} días`}
          detalle={formatearFecha(masAntiguo.fecha_ingreso)}
          tono={masAntiguo.dias > 60 ? "negativo" : "neutro"}
        />
      </div>

      <section className="bg-surface border border-line p-5 mb-6 rounded-sm">
        <h3 className="label-col mb-3">
          Distribución por tramo de antigüedad
        </h3>
        <BarrasHorizontales
          datos={resumen.map((t) => ({
            etiqueta: t.etiqueta,
            valor: t.kg,
            estado: t.estado,
          }))}
          formatoValor={(v) => `${formatearNumero(v)} kg`}
        />
      </section>

      <section className="mb-6">
        <div className="overflow-x-auto border border-line">
          <TableModular className="text-left">
            <TableHeader>
              <tr>
                <TableHead>
                  Tramo
                </TableHead>
                <TableHead className="text-right">
                  Lotes
                </TableHead>
                <TableHead className="text-right">
                  Cajas
                </TableHead>
                <TableHead className="text-right">
                  Kg
                </TableHead>
                <TableHead className="text-right">
                  % del total
                </TableHead>
              </tr>
            </TableHeader>
            <tbody>
              {resumen.map((tramo) => (
                <tr key={tramo.etiqueta} className="hover:bg-gray-50">
                  <td className="border-b border-line px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 ${MUESTRA_POR_ESTADO[tramo.estado]}`}
                      />
                      {tramo.etiqueta}
                    </span>
                  </td>
                  <td className="border-b border-line px-3 py-2 text-right tabular-nums">
                    {tramo.lotes || "-"}
                  </td>
                  <td className="border-b border-line px-3 py-2 text-right tabular-nums">
                    {tramo.cajas ? formatearEntero(tramo.cajas) : "-"}
                  </td>
                  <td className="border-b border-line px-3 py-2 text-right tabular-nums font-medium">
                    {tramo.kg ? formatearNumero(tramo.kg) : "-"}
                  </td>
                  <td className="border-b border-line px-3 py-2 text-right tabular-nums text-gray-600">
                    {totalKg > 0
                      ? `${formatearNumero((tramo.kg / totalKg) * 100, 1)} %`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {conStock.length}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatearEntero(totalCajas)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatearNumero(totalKg)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">100,0 %</td>
              </tr>
            </tfoot>
          </TableModular>
        </div>
      </section>

      <section>
        <h3 className="label-col mb-2">
          Lotes ordenados por antigüedad
        </h3>
        <div className="overflow-x-auto border border-line">
          <TableModular className="text-left">
            <TableHeader>
              <tr>
                <TableHead>
                  Variante
                </TableHead>
                <TableHead>
                  Fecha de lote
                </TableHead>
                <TableHead className="text-right">
                  Antigüedad
                </TableHead>
                <TableHead>
                  Tramo
                </TableHead>
                <TableHead className="text-right">
                  Cajas
                </TableHead>
                <TableHead className="text-right">
                  Kg
                </TableHead>
              </tr>
            </TableHeader>
            <tbody>
              {conStock.map((lote) => {
                const tramo = tramoDe(lote.dias);
                return (
                  <tr
                    key={`${lote.variante_id}-${lote.fecha_ingreso}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b border-line px-3 py-2 font-mono text-xs text-blue-900">
                      {lote.codigo_completo}
                    </td>
                    <td className="border-b border-line px-3 py-2">
                      {formatearFecha(lote.fecha_ingreso)}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums font-medium">
                      {lote.dias} días
                    </td>
                    <td className="border-b border-line px-3 py-2">
                      <Badge variant={tramo.estado}>{tramo.etiqueta}</Badge>
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums">
                      {formatearEntero(lote.stock_cajas)}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums">
                      {formatearNumero(lote.stock_kg)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableModular>
        </div>
      </section>
    </div>
  );
}
