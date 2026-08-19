import { useEffect, useMemo, useState } from "react";
import { Input, Select } from "@/components/common";
import { Anchor, Package, Ship, Truck, Users } from "lucide-react";
import { obtenerMovimientos, partesService } from "@/services";
import {
  Cargando,
  EncabezadoReporte,
  Indicador,
  PanelVacio,
  formatearEntero,
  formatearFecha,
  formatearNumero,
} from "./shared";

// Diagrama de flujo del lote: de donde vino y a donde fue. Se dibuja en SVG
// para que se entienda de un vistazo antes de leer las tablas.
function DiagramaFlujo({ origen, lote, destinos }) {
  const alto = Math.max(200, 90 + destinos.length * 46);
  const ancho = 900;
  const xOrigen = 20;
  const xLote = 340;
  const xDestino = 640;
  const anchoCaja = 230;
  const yLote = alto / 2 - 40;

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full" role="img">
      {/* Origen */}
      <rect
        x={xOrigen}
        y={yLote}
        width={anchoCaja}
        height="80"
        rx="6"
        className="fill-white"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />
      <text
        x={xOrigen + 14}
        y={yLote + 22}
        className="fill-gray-500"
        style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        Origen
      </text>
      <text
        x={xOrigen + 14}
        y={yLote + 43}
        className="fill-gray-900"
        style={{ fontSize: 13, fontWeight: 600 }}
      >
        {origen?.codigo ?? "Sin documento"}
      </text>
      <text
        x={xOrigen + 14}
        y={yLote + 62}
        className="fill-gray-500"
        style={{ fontSize: 11 }}
      >
        {origen?.embarcaciones ?? 0} embarcación
        {origen?.embarcaciones === 1 ? "" : "es"}
        {origen?.fecha ? ` · ${formatearFecha(origen.fecha)}` : ""}
      </text>

      {/* Flecha origen -> lote */}
      <line
        x1={xOrigen + anchoCaja}
        y1={yLote + 40}
        x2={xLote - 8}
        y2={yLote + 40}
        stroke="#94a3b8"
        strokeWidth="1.5"
        markerEnd="url(#punta)"
      />

      {/* Lote */}
      <rect
        x={xLote}
        y={yLote}
        width={anchoCaja}
        height="80"
        rx="6"
        fill="#1e3a8a"
      />
      <text
        x={xLote + 14}
        y={yLote + 22}
        fill="#bfdbfe"
        style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}
      >
        Lote
      </text>
      <text
        x={xLote + 14}
        y={yLote + 43}
        fill="#ffffff"
        style={{ fontSize: 12, fontWeight: 600 }}
      >
        {lote.codigo_completo.length > 26
          ? `${lote.codigo_completo.slice(0, 26)}…`
          : lote.codigo_completo}
      </text>
      <text
        x={xLote + 14}
        y={yLote + 62}
        fill="#bfdbfe"
        style={{ fontSize: 11 }}
      >
        {formatearFecha(lote.fecha_lote)} · {formatearEntero(lote.cajas)} cajas
      </text>

      {/* Destinos */}
      {destinos.length === 0 ? (
        <>
          <line
            x1={xLote + anchoCaja}
            y1={yLote + 40}
            x2={xDestino - 8}
            y2={yLote + 40}
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={xDestino}
            y={yLote + 44}
            className="fill-gray-400"
            style={{ fontSize: 12, fontStyle: "italic" }}
          >
            Sin despachos registrados
          </text>
        </>
      ) : (
        destinos.map((destino, indice) => {
          const y = 40 + indice * 46;
          return (
            <g key={`${destino.documento_codigo}-${indice}`}>
              <path
                d={`M ${xLote + anchoCaja} ${yLote + 40} C ${xLote + anchoCaja + 50} ${yLote + 40}, ${xDestino - 50} ${y + 20}, ${xDestino - 8} ${y + 20}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                markerEnd="url(#punta)"
              />
              <rect
                x={xDestino}
                y={y}
                width={ancho - xDestino - 20}
                height="40"
                rx="5"
                className="fill-white"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <text
                x={xDestino + 12}
                y={y + 17}
                className="fill-gray-900"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {destino.cliente ?? "Sin cliente"}
              </text>
              <text
                x={xDestino + 12}
                y={y + 32}
                className="fill-gray-500"
                style={{ fontSize: 10 }}
              >
                {destino.documento_codigo} · {formatearFecha(destino.fecha)} ·{" "}
                {formatearEntero(destino.cajas)} cajas
              </text>
            </g>
          );
        })
      )}

      <defs>
        <marker
          id="punta"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8 z" fill="#94a3b8" />
        </marker>
      </defs>
    </svg>
  );
}

export default function ReporteTrazabilidad({ especieId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");
  const [detalleOrigen, setDetalleOrigen] = useState(null);

  useEffect(() => {
    let vigente = true;
    obtenerMovimientos({ especieId })
      .then((data) => vigente && setMovimientos(data || []))
      .catch((e) => vigente && setError(e.message || String(e)))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [especieId]);

  // Cada lote es una combinacion de variante y fecha de produccion
  const lotes = useMemo(() => {
    const mapa = new Map();
    for (const m of movimientos) {
      if (m.tipo !== "INGRESO" || !m.fecha_lote) continue;
      const clave = `${m.variante_id}|${m.fecha_lote}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          variante_id: m.variante_id,
          fecha_lote: m.fecha_lote,
          codigo_completo: m.codigo_completo,
          cajas: 0,
          kg: 0,
          codigos_trazabilidad: new Set(),
          documentos: new Set(),
        });
      }
      const lote = mapa.get(clave);
      lote.cajas += m.cajas;
      lote.kg += m.kg;
      if (m.codigo_trazabilidad) lote.codigos_trazabilidad.add(m.codigo_trazabilidad);
      if (m.documento_id) lote.documentos.add(m.documento_id);
    }
    return [...mapa.values()].sort(
      (a, b) =>
        b.fecha_lote.localeCompare(a.fecha_lote) ||
        a.codigo_completo.localeCompare(b.codigo_completo, "es"),
    );
  }, [movimientos]);

  // La busqueda por codigo de trazabilidad apunta al lote que lo contiene
  const lotesFiltrados = useMemo(() => {
    if (!busquedaCodigo.trim()) return lotes;
    const termino = busquedaCodigo.trim().toLowerCase();
    return lotes.filter(
      (l) =>
        [...l.codigos_trazabilidad].some((c) =>
          c.toLowerCase().includes(termino),
        ) || l.codigo_completo.toLowerCase().includes(termino),
    );
  }, [lotes, busquedaCodigo]);

  const lote = lotes.find((l) => l.clave === loteSeleccionado);

  // Salidas que declararon consumir este lote
  const destinos = useMemo(() => {
    if (!lote) return [];
    return movimientos
      .filter(
        (m) =>
          m.tipo === "SALIDA" &&
          m.variante_id === lote.variante_id &&
          m.fecha_lote === lote.fecha_lote,
      )
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }, [movimientos, lote]);

  const ingresosDelLote = useMemo(() => {
    if (!lote) return [];
    return movimientos.filter(
      (m) =>
        m.tipo === "INGRESO" &&
        m.variante_id === lote.variante_id &&
        m.fecha_lote === lote.fecha_lote,
    );
  }, [movimientos, lote]);

  // El detalle de embarcaciones vive en el documento de ingreso
  useEffect(() => {
    if (!lote || ingresosDelLote.length === 0) {
      setDetalleOrigen(null);
      return;
    }
    let vigente = true;
    partesService
      .obtenerParte(ingresosDelLote[0].documento_id)
      .then((parte) => vigente && setDetalleOrigen(parte))
      .catch(() => vigente && setDetalleOrigen(null));
    return () => {
      vigente = false;
    };
  }, [lote, ingresosDelLote]);

  if (cargando) return <Cargando />;
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const embarcaciones =
    detalleOrigen?.transportes?.flatMap((t) => t.embarcaciones ?? []) ?? [];
  const despachado = destinos.reduce((t, d) => t + d.cajas, 0);
  const despachadoKg = destinos.reduce((t, d) => t + d.kg, 0);

  return (
    <div>
      <EncabezadoReporte
        titulo="Trazabilidad de lote"
        descripcion="Recorrido completo de una partida: de qué documento y embarcación proviene, y a qué clientes se despachó."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface border border-line p-4 mb-6">
        <Input
          label="Buscar por código de trazabilidad o variante"
          value={busquedaCodigo}
          onChange={(e) => setBusquedaCodigo(e.target.value)}
          placeholder="Ej: TRZ-123456"
        />
        <Select
          label={`Lote (${lotesFiltrados.length} disponibles)`}
          value={loteSeleccionado}
          onChange={(e) => setLoteSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un lote...</option>
          {lotesFiltrados.map((l) => (
            <option key={l.clave} value={l.clave}>
              {l.codigo_completo} — {formatearFecha(l.fecha_lote)}
            </option>
          ))}
        </Select>
      </div>

      {!lote ? (
        <PanelVacio mensaje="Seleccione un lote para ver su trazabilidad" />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Indicador
              etiqueta="Producido"
              valor={`${formatearEntero(lote.cajas)} cajas`}
              detalle={`${formatearNumero(lote.kg)} kg`}
              tono="positivo"
            />
            <Indicador
              etiqueta="Despachado"
              valor={`${formatearEntero(despachado)} cajas`}
              detalle={`${formatearNumero(despachadoKg)} kg`}
            />
            <Indicador
              etiqueta="En almacén"
              valor={`${formatearEntero(lote.cajas - despachado)} cajas`}
              detalle={`${formatearNumero(lote.kg - despachadoKg)} kg`}
            />
            <Indicador
              etiqueta="Clientes alcanzados"
              valor={new Set(destinos.map((d) => d.cliente)).size}
              detalle={`${destinos.length} despacho${destinos.length === 1 ? "" : "s"}`}
            />
          </div>

          <section className="bg-surface border border-line p-5 mb-6">
            <h3 className="label-col mb-3">
              Recorrido del lote
            </h3>
            <DiagramaFlujo
              origen={{
                codigo: detalleOrigen?.codigo ?? ingresosDelLote[0]?.documento_codigo,
                fecha: detalleOrigen?.fecha,
                embarcaciones: embarcaciones.length,
              }}
              lote={lote}
              destinos={destinos}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-surface border border-line p-5">
              <h3 className="label-col mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Origen
              </h3>
              {detalleOrigen ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-gray-500">Documento</dt>
                    <dd className="font-mono text-gray-900">
                      {detalleOrigen.codigo ?? "-"}
                      {detalleOrigen.tipo_documento_codigo && (
                        <span className="ml-2 text-xs text-gray-500">
                          {detalleOrigen.tipo_documento_codigo}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-gray-500">Fecha de producción</dt>
                    <dd className="text-gray-900">
                      {formatearFecha(detalleOrigen.fecha)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-gray-500">Turno</dt>
                    <dd className="text-gray-900">{detalleOrigen.turno ?? "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-2">
                    <dt className="text-gray-500">Cód. trazabilidad</dt>
                    <dd className="font-mono text-gray-900">
                      {detalleOrigen.codigo_trazabilidad ?? "-"}
                    </dd>
                  </div>

                  <div className="pt-2">
                    <p className="text-gray-500 flex items-center gap-2 mb-2">
                      <Ship className="w-4 h-4" /> Embarcaciones
                    </p>
                    {embarcaciones.length === 0 ? (
                      <p className="text-gray-400 italic text-sm">
                        Sin embarcaciones registradas
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {embarcaciones.map((e, i) => (
                          <li
                            key={i}
                            className="flex justify-between gap-4 text-sm bg-gray-50 px-2 py-1.5"
                          >
                            <span className="text-gray-800">
                              {e.nombre_embarcacion_pesquera ?? "Sin nombre"}
                              {e.matricula_embarcacion_pesquera && (
                                <span className="text-gray-500 text-xs ml-2">
                                  {e.matricula_embarcacion_pesquera}
                                </span>
                              )}
                            </span>
                            <span className="tabular-nums text-gray-700">
                              {formatearNumero(e.peso_total_kg)} kg
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {detalleOrigen.transportes?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-gray-500 flex items-center gap-2 mb-2">
                        <Truck className="w-4 h-4" /> Transporte
                      </p>
                      <ul className="space-y-1">
                        {detalleOrigen.transportes.map((t, i) => (
                          <li
                            key={i}
                            className="text-sm bg-gray-50 px-2 py-1.5 text-gray-700"
                          >
                            Guía {t.num_guia ?? "-"} · Carro {t.num_carro ?? "-"} ·
                            Placa {t.placa ?? "-"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  No se pudo cargar el documento de origen
                </p>
              )}
            </section>

            <section className="bg-surface border border-line p-5">
              <h3 className="label-col mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                Destinos
              </h3>
              {destinos.length === 0 ? (
                <p className="text-gray-400 italic text-sm">
                  Este lote todavía no fue despachado
                </p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-xs uppercase text-gray-500">
                      <th className="text-left pb-2 border-b border-line">
                        Fecha
                      </th>
                      <th className="text-left pb-2 border-b border-line">
                        Documento
                      </th>
                      <th className="text-left pb-2 border-b border-line">
                        Cliente
                      </th>
                      <th className="text-right pb-2 border-b border-line">
                        Cajas
                      </th>
                      <th className="text-right pb-2 border-b border-line">
                        Kg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {destinos.map((d, i) => (
                      <tr key={i} className="border-b border-line">
                        <td className="py-2 whitespace-nowrap">
                          {formatearFecha(d.fecha)}
                        </td>
                        <td className="py-2 font-mono text-xs">
                          {d.documento_codigo}
                        </td>
                        <td className="py-2 text-gray-700">{d.cliente ?? "-"}</td>
                        <td className="py-2 text-right tabular-nums">
                          {formatearEntero(d.cajas)}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {formatearNumero(d.kg)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {lote.codigos_trazabilidad.size > 0 && (
                <div className="mt-4 pt-4 border-t border-line">
                  <p className="text-gray-500 flex items-center gap-2 mb-2 text-sm">
                    <Anchor className="w-4 h-4" /> Códigos de trazabilidad
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[...lote.codigos_trazabilidad].map((c) => (
                      <span
                        key={c}
                        className="font-mono text-xs bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
