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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              disabled={!reporte.usaRango}
              className="w-full px-3 py-2 border border-line focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              disabled={!reporte.usaRango}
              className="w-full px-3 py-2 border border-line focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
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
            <p className="text-xs text-gray-500 pb-2">
              Este reporte muestra la situación actual, no depende del rango de
              fechas.
            </p>
          )}
        </div>
      </div>

      {/* Selector de reporte */}
      <nav className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border-x border-b border-line">
        {REPORTES.map((r) => {
          const Icono = r.icono;
          const activo = r.id === reporteActivo;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setReporteActivo(r.id)}
              className={`text-left px-4 py-3 transition-colors ${
                activo
                  ? "bg-white border-t-2 border-t-blue-900"
                  : "bg-gray-50 hover:bg-white border-t-2 border-t-transparent"
              }`}
            >
              <span
                className={`flex items-center gap-2 font-semibold text-sm ${
                  activo ? "text-blue-900" : "text-gray-700"
                }`}
              >
                <Icono className="w-4 h-4" />
                {r.nombre}
              </span>
              <span className="block text-xs text-gray-500 mt-0.5">
                {r.descripcion}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="bg-surface border-x border-b border-line px-6 py-6">
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
