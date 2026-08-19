import { useEffect, useState } from "react";
import { CalendarRange, ClipboardList, GitBranch, Timer } from "lucide-react";
import { Select } from "@/components/common";
import { obtenerEspecies } from "@/services";
import {
  ReporteAntiguedad,
  ReporteHistorialMovimientos,
  ReporteMovimientoDiario,
  ReporteTrazabilidad,
} from "@/components/reportes";
import { haceDiasIso, hoyIso } from "@/components/reportes/shared";

const REPORTES = [
  {
    id: "movimiento",
    nombre: "Movimiento diario",
    descripcion: "Producción, salidas y saldo por variante",
    icono: ClipboardList,
    usaRango: true,
  },
  {
    id: "antiguedad",
    nombre: "Antigüedad",
    descripcion: "Rotación de existencias por tiempo almacenado",
    icono: Timer,
    usaRango: false,
  },
  {
    id: "historial",
    nombre: "Historial de movimientos",
    descripcion: "Entradas y salidas de una variante con saldo corrido",
    icono: CalendarRange,
    usaRango: true,
  },
  {
    id: "trazabilidad",
    nombre: "Trazabilidad",
    descripcion: "Origen y destino de un lote",
    icono: GitBranch,
    usaRango: false,
  },
];

export default function ReportesPage() {
  const [reporteActivo, setReporteActivo] = useState("movimiento");
  const [desde, setDesde] = useState(haceDiasIso(90));
  const [hasta, setHasta] = useState(hoyIso());
  const [especieId, setEspecieId] = useState("");
  const [especies, setEspecies] = useState([]);

  useEffect(() => {
    obtenerEspecies()
      .then((data) => setEspecies(data || []))
      .catch(() => setEspecies([]));
  }, []);

  const reporte = REPORTES.find((r) => r.id === reporteActivo);
  const especieFiltro = especieId ? Number(especieId) : null;

  return (
    <div className="px-5 py-4">
      {/* Filtros comunes */}
      <div className="border border-line bg-surface px-3 py-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="label-col mb-1 block">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              disabled={!reporte.usaRango}
              className="input"
            />
          </div>
          <div>
            <label className="label-col mb-1 block">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              disabled={!reporte.usaRango}
              className="input"
            />
          </div>
          <Select
            label="Especie"
            value={especieId}
            onChange={(e) => setEspecieId(e.target.value)}
          >
            <option value="">Todas las especies</option>
            {especies.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </Select>
          {!reporte.usaRango && (
            <p className="pb-1.5 text-xs text-ink-muted">
              Este reporte muestra la situación actual, no depende del rango de
              fechas.
            </p>
          )}
        </div>
      </div>

      {/* Selector de reporte */}
      <nav className="grid grid-cols-2 gap-px border-x border-b border-line bg-line lg:grid-cols-4">
        {REPORTES.map((r) => {
          const Icono = r.icono;
          const activo = r.id === reporteActivo;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setReporteActivo(r.id)}
              className={`border-t-2 px-3 py-2 text-left transition-colors ${
                activo
                  ? "border-t-navy bg-surface"
                  : "border-t-transparent bg-gray-50 hover:bg-surface"
              }`}
            >
              <span
                className={`flex items-center gap-2 text-xs font-medium tracking-[0.08em] uppercase ${
                  activo ? "text-navy" : "text-ink-muted"
                }`}
              >
                <Icono size={14} strokeWidth={1.75} />
                {r.nombre}
              </span>
              <span className="mt-0.5 block text-xs text-ink-faint normal-case">
                {r.descripcion}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-x border-b border-line bg-surface px-3 py-3">
        {reporteActivo === "movimiento" && (
          <ReporteMovimientoDiario
            desde={desde}
            hasta={hasta}
            especieId={especieFiltro}
          />
        )}
        {reporteActivo === "antiguedad" && (
          <ReporteAntiguedad especieId={especieFiltro} />
        )}
        {reporteActivo === "historial" && (
          <ReporteHistorialMovimientos
            desde={desde}
            hasta={hasta}
            especieId={especieFiltro}
          />
        )}
        {reporteActivo === "trazabilidad" && (
          <ReporteTrazabilidad especieId={especieFiltro} />
        )}
      </div>
    </div>
  );
}
