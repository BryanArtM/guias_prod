import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Select } from "@/components/common";
import { ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import { obtenerMovimientos, obtenerVariantesCompletas } from "@/services";
import {
  TableModular,
  TableHeader,
  TableHead,
} from "@/components/common/Table";
import {
  Cargando,
  EncabezadoReporte,
  GraficoSaldo,
  Indicador,
  PanelVacio,
  UNIDAD_CAJAS,
  UNIDAD_KG,
  descargarCSV,
  formatearCelda,
  formatearFecha,
  formatearNumero,
} from "./shared";

// Movimiento cronologico de una variante con saldo corrido. Responde a la
// pregunta "por que tengo esta cantidad": cada linea indica el documento que
// la origino.
export default function ReporteHistorialMovimientos({
  desde,
  hasta,
  especieId,
}) {
  const [variantes, setVariantes] = useState([]);
  const [varianteId, setVarianteId] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [cargandoVariantes, setCargandoVariantes] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [unidad, setUnidad] = useState(UNIDAD_KG);
  const [avisoExport, setAvisoExport] = useState(null);

  useEffect(() => {
    let vigente = true;
    obtenerVariantesCompletas()
      .then((data) => {
        if (vigente) setVariantes(data || []);
      })
      .catch((e) => vigente && setError(e.message || String(e)))
      .finally(() => vigente && setCargandoVariantes(false));
    return () => {
      vigente = false;
    };
  }, []);

  const variantesDisponibles = useMemo(
    () =>
      variantes
        .filter((v) => !especieId || v.especie_id === Number(especieId))
        .sort((a, b) => a.codigo_completo.localeCompare(b.codigo_completo, "es")),
    [variantes, especieId],
  );

  // Si al cambiar de especie la variante elegida deja de aplicar, se limpia
  useEffect(() => {
    if (
      varianteId &&
      !variantesDisponibles.some((v) => String(v.variante_id) === String(varianteId))
    ) {
      setVarianteId("");
    }
  }, [variantesDisponibles, varianteId]);

  useEffect(() => {
    if (!varianteId) {
      setMovimientos([]);
      return;
    }
    let vigente = true;
    setCargando(true);
    setError(null);
    // Se traen todos los movimientos historicos de la variante para que el
    // saldo corrido arranque desde el origen y no desde un corte arbitrario.
    obtenerMovimientos({ varianteId: Number(varianteId) })
      .then((data) => vigente && setMovimientos(data || []))
      .catch((e) => vigente && setError(e.message || String(e)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [varianteId]);

  const campo = unidad === UNIDAD_CAJAS ? "cajas" : "kg";

  const lineas = useMemo(() => {
    let saldo = 0;
    return movimientos.map((m) => {
      const cantidad = m[campo];
      const entrada = m.tipo === "INGRESO" ? cantidad : 0;
      const salida = m.tipo === "SALIDA" ? cantidad : 0;
      saldo += entrada - salida;
      return { ...m, entrada, salida, saldo };
    });
  }, [movimientos, campo]);

  // El grafico y los totales respetan el rango del filtro; el saldo inicial es
  // el que traia la variante justo antes de ese rango.
  const enRango = useMemo(
    () =>
      lineas.filter(
        (l) => (!desde || l.fecha >= desde) && (!hasta || l.fecha <= hasta),
      ),
    [lineas, desde, hasta],
  );

  const saldoInicial = useMemo(() => {
    const previas = lineas.filter((l) => desde && l.fecha < desde);
    return previas.length > 0 ? previas[previas.length - 1].saldo : 0;
  }, [lineas, desde]);

  const varianteElegida = variantesDisponibles.find(
    (v) => String(v.variante_id) === String(varianteId),
  );

  const totalEntradas = enRango.reduce((t, l) => t + l.entrada, 0);
  const totalSalidas = enRango.reduce((t, l) => t + l.salida, 0);
  const saldoFinal = enRango.length > 0 ? enRango[enRango.length - 1].saldo : saldoInicial;

  const exportar = async () => {
    try {
      const ruta = await descargarCSV(
        `historial_${varianteElegida?.codigo_completo.replace(/\s+/g, "_") ?? "variante"}`,
        [
          "Fecha",
          "Tipo",
          "Documento",
          "Cliente",
          "Lote",
          "Entrada",
          "Salida",
          "Saldo",
        ],
        enRango.map((l) => [
          l.fecha,
          l.tipo,
          l.documento_codigo ?? "",
          l.cliente ?? "",
          l.fecha_lote ?? "",
          l.entrada || 0,
          l.salida || 0,
          Number(l.saldo).toFixed(2),
        ]),
      );
      setAvisoExport(`Archivo guardado en ${ruta}`);
    } catch (e) {
      setAvisoExport(`No se pudo exportar: ${e.message || e}`);
    }
  };

  if (cargandoVariantes) return <Cargando />;

  return (
    <div>
      <EncabezadoReporte
        titulo="Historial de movimientos por variante"
        descripcion="Historial cronológico de entradas y salidas con saldo corrido. Cada línea identifica el documento que originó el movimiento."
        acciones={
          varianteId && (
            <>
              <div className="flex rounded-sm border border-line overflow-hidden">
                {[UNIDAD_KG, UNIDAD_CAJAS].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnidad(u)}
                    className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                      unidad === u
                        ? "bg-blue-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                onClick={exportar}
                icon={<Download className="w-4 h-4" />}
                iconPosition="left"
              >
                CSV
              </Button>
            </>
          )
        }
      />

      <div className="bg-surface border border-line p-4 mb-6 max-w-xl rounded-sm">
        <Select
          label="Variante a consultar"
          value={varianteId}
          onChange={(e) => setVarianteId(e.target.value)}
        >
          <option value="">Seleccione una variante...</option>
          {variantesDisponibles.map((v) => (
            <option key={v.variante_id} value={v.variante_id}>
              {v.codigo_completo}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

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

      {!varianteId ? (
        <PanelVacio mensaje="Seleccione una variante para ver su historial" />
      ) : cargando ? (
        <Cargando />
      ) : enRango.length === 0 ? (
        <PanelVacio mensaje="Esta variante no tiene movimientos en el período seleccionado" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Indicador
              etiqueta="Saldo inicial"
              valor={`${formatearCelda(saldoInicial, unidad)} ${unidad}`}
              detalle={desde ? `Al ${formatearFecha(desde)}` : "Desde el origen"}
            />
            <Indicador
              etiqueta="Entradas"
              valor={`${formatearCelda(totalEntradas, unidad)} ${unidad}`}
              tono="positivo"
            />
            <Indicador
              etiqueta="Salidas"
              valor={`${formatearCelda(totalSalidas, unidad)} ${unidad}`}
            />
            <Indicador
              etiqueta="Saldo final"
              valor={`${formatearCelda(saldoFinal, unidad)} ${unidad}`}
              tono={saldoFinal < 0 ? "negativo" : "positivo"}
            />
          </div>

          <section className="bg-surface border border-line p-5 mb-6 rounded-sm">
            <h3 className="label-col mb-3">
              Evolución del saldo — {varianteElegida?.codigo_completo}
            </h3>
            <GraficoSaldo
              puntos={enRango.map((l) => ({
                etiqueta: formatearFecha(l.fecha),
                valor: l.saldo,
              }))}
              formatoValor={(v) => formatearNumero(v, 0)}
            />
          </section>

          <div className="overflow-x-auto rounded-sm border border-line">
            <TableModular className="text-left">
              <TableHeader>
                <tr>
                  <TableHead>
                    Fecha
                  </TableHead>
                  <TableHead>
                    Movimiento
                  </TableHead>
                  <TableHead>
                    Documento
                  </TableHead>
                  <TableHead>
                    Cliente
                  </TableHead>
                  <TableHead>
                    Lote
                  </TableHead>
                  <TableHead className="text-right">
                    Entrada
                  </TableHead>
                  <TableHead className="text-right">
                    Salida
                  </TableHead>
                  <TableHead className="text-right">
                    Saldo
                  </TableHead>
                </tr>
              </TableHeader>
              <tbody>
                <tr className="bg-gray-50 text-gray-600">
                  <td className="border-b border-line px-3 py-2" colSpan={7}>
                    Saldo inicial del período
                  </td>
                  <td className="border-b border-line px-3 py-2 text-right tabular-nums font-medium">
                    {formatearCelda(saldoInicial, unidad)}
                  </td>
                </tr>
                {enRango.map((linea, indice) => (
                  <tr
                    key={`${linea.tipo}-${linea.documento_id}-${indice}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border-b border-line px-3 py-2 whitespace-nowrap">
                      {formatearFecha(linea.fecha)}
                    </td>
                    <td className="border-b border-line px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                          linea.tipo === "INGRESO"
                            ? "text-blue-800"
                            : "text-ink-muted"
                        }`}
                      >
                        {linea.tipo === "INGRESO" ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {linea.tipo === "INGRESO" ? "Ingreso" : "Salida"}
                        {linea.documento_tipo && (
                          <span className="text-gray-400">
                            · {linea.documento_tipo}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="border-b border-line px-3 py-2 font-mono text-xs">
                      {linea.documento_codigo ?? "-"}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-gray-600">
                      {linea.cliente ?? "-"}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-gray-600 whitespace-nowrap">
                      {formatearFecha(linea.fecha_lote)}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums text-blue-800">
                      {linea.entrada ? formatearCelda(linea.entrada, unidad) : "-"}
                    </td>
                    <td className="border-b border-line px-3 py-2 text-right tabular-nums">
                      {linea.salida ? formatearCelda(linea.salida, unidad) : "-"}
                    </td>
                    <td
                      className={`border-b border-line px-3 py-2 text-right tabular-nums font-semibold ${
                        linea.saldo < 0 ? "text-crit" : "text-ink"
                      }`}
                    >
                      {formatearCelda(linea.saldo, unidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableModular>
          </div>
        </>
      )}
    </div>
  );
}
