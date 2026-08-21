import { useState, useEffect } from "react";
import {
  BarChart3,
  Fish,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import {
  Alert,
  Loading,
  Panel,
  ProgressBar,
  StatCard,
} from "@/components/common";
import {
  obtenerEspecies,
  obtenerVariantesCompletas,
  obtenerIngresos,
  obtenerSalidas,
  obtenerStockPorVariante,
} from "@/services";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [stats, setStats] = useState({
    totalEspecies: 0,
    totalVariantes: 0,
    totalIngresos: 0,
    totalSalidas: 0,
    stockCritico: 0,
    stockNormal: 0,
    ingresosUltimos30: [],
    salidasUltimas30: [],
    top10Variantes: [],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setAlert(null); // Limpiar alertas previas
    try {
      const [especies, variantes, ingresos, salidas, stock] = await Promise.all(
        [
          obtenerEspecies(),
          obtenerVariantesCompletas(),
          obtenerIngresos(),
          obtenerSalidas(),
          obtenerStockPorVariante(),
        ],
      );

      // Calcular fecha de hace 30 días
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      const fecha30 = hace30Dias.toISOString().split("T")[0];

      // Filtrar ingresos y salidas de últimos 30 días
      const ingresosRecientes = ingresos.filter((i) => i.fecha >= fecha30);
      const salidasRecientes = salidas.filter((s) => s.fecha >= fecha30);

      // Contar stock crítico (menos de 10 kg)
      const stockCritico = stock.filter(
        (s) => s.kg_stock < 10 && s.kg_stock > 0,
      ).length;
      const stockNormal = stock.filter((s) => s.kg_stock >= 10).length;

      // Top 10 variantes con más stock
      const top10 = [...stock]
        .filter((s) => s.kg_stock > 0)
        .sort((a, b) => b.kg_stock - a.kg_stock)
        .slice(0, 10);

      setStats({
        totalEspecies: especies.length,
        totalVariantes: variantes.length,
        totalIngresos: ingresosRecientes.length,
        totalSalidas: salidasRecientes.length,
        stockCritico,
        stockNormal,
        ingresosUltimos30: ingresosRecientes,
        salidasUltimas30: salidasRecientes,
        top10Variantes: top10,
      });
    } catch (error) {
      // Solo mostrar alerta si NO es la primera carga
      // En la primera carga, simplemente dejamos los stats en 0
      if (!firstLoad) {
        setAlert({
          message: "Error al cargar datos: " + (error.message || String(error)),
          type: "error",
        });
      }
    } finally {
      setLoading(false);
      setFirstLoad(false); // Marcar que ya pasó la primera carga
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Cargando estadísticas..." />;
  }

  // El KPI mas alto fija la escala de las barras del ranking
  const stockMaximo = stats.top10Variantes.reduce(
    (maximo, variante) => Math.max(maximo, variante.kg_stock),
    0,
  );

  return (
    <div className="px-5 py-4">
      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} className="mb-4">
          {alert.message}
        </Alert>
      )}

      <div className="mb-4 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-6">
        <StatCard label="Especies" value={stats.totalEspecies} icon={Fish} />
        <StatCard label="Variantes" value={stats.totalVariantes} icon={Package} />
        <StatCard
          label="Ingresos"
          value={stats.totalIngresos}
          nota="Últimos 30 días"
          icon={TrendingUp}
        />
        <StatCard
          label="Salidas"
          value={stats.totalSalidas}
          nota="Últimos 30 días"
          icon={TrendingDown}
        />
        <StatCard
          label="Stock crítico"
          value={stats.stockCritico}
          estado={stats.stockCritico > 0 ? "crit" : "ok"}
          nota="Bajo 10 kg"
          icon={AlertTriangle}
        />
        <StatCard
          label="Stock normal"
          value={stats.stockNormal}
          estado="ok"
          nota="10 kg o más"
          icon={CheckCircle}
        />
      </div>

      <Panel
        title="Top 10 variantes con mayor stock"
        actions={<BarChart3 size={15} className="text-steel" />}
        padding="none"
        className="mb-4"
      >
        {stats.top10Variantes.length > 0 ? (
          <table className="table">
            <tbody>
              {stats.top10Variantes.map((variante, indice) => (
                <tr
                  key={variante.variante_id}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="num w-10 px-3 py-1.5 text-center text-ink-faint">
                    {indice + 1}
                  </td>
                  <td className="num px-2 py-1.5 font-medium text-navy">
                    {variante.codigo_completo}
                  </td>
                  <td className="w-1/3 px-2 py-1.5">
                    <ProgressBar
                      value={variante.kg_stock}
                      max={stockMaximo}
                      mostrarValor={false}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium">
                    {variante.kg_stock.toFixed(2)}
                    <span className="ml-1 text-xs text-ink-faint">kg</span>
                  </td>
                  <td className="px-3 py-1.5 text-right text-ink-muted">
                    {variante.cajas_stock}
                    <span className="ml-1 text-xs text-ink-faint">cajas</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-3 py-6 text-center text-ink-muted">
            No hay variantes con stock disponible
          </p>
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Últimos 5 ingresos" padding="none">
          <MovimientosRecientes
            movimientos={stats.ingresosUltimos30.slice(0, 5)}
            obtenerCodigo={(m) => m.codigo}
            vacio="Sin ingresos en los últimos 30 días"
          />
        </Panel>

        <Panel title="Últimas 5 salidas" padding="none">
          <MovimientosRecientes
            movimientos={stats.salidasUltimas30.slice(0, 5)}
            obtenerCodigo={(m) => m.numero_control}
            vacio="Sin salidas en los últimos 30 días"
          />
        </Panel>
      </div>
    </div>
  );
}

function MovimientosRecientes({ movimientos, obtenerCodigo, vacio }) {
  if (movimientos.length === 0) {
    return <p className="px-3 py-6 text-center text-ink-muted">{vacio}</p>;
  }

  return (
    <table className="table">
      <tbody>
        {movimientos.map((movimiento) => (
          <tr key={movimiento.id} className="border-b border-line last:border-b-0">
            <td className="num px-3 py-1.5 whitespace-nowrap">
              {movimiento.fecha}
            </td>
            <td className="num px-2 py-1.5 text-ink-muted">
              {obtenerCodigo(movimiento) || "Sin código"}
            </td>
            <td className="px-2 py-1.5 font-medium">
              {movimiento.especie_nombre || "—"}
            </td>
            <td className="truncate px-3 py-1.5 text-right text-ink-muted">
              {movimiento.cliente || "Sin cliente"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

MovimientosRecientes.propTypes = {
  movimientos: PropTypes.arrayOf(PropTypes.object).isRequired,
  obtenerCodigo: PropTypes.func.isRequired,
  vacio: PropTypes.string.isRequired,
};
