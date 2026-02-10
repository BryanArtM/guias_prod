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
import { StatsCard } from "../components/dashboard/StatsCard";
import { Loading } from "../components/common/Loading";
import { Alert } from "../components/common/Alert";
import {
  obtenerEspecies,
  obtenerVariantesCompletas,
  obtenerIngresos,
  obtenerSalidas,
  obtenerStockPorVariante,
} from "../services/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
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
      setAlert({
        message: "Error al cargar datos: " + error.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading mensaje="Cargando estadísticas..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Resumen general del sistema de inventario
        </p>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert variant={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      {/* Grid de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Especies"
          value={stats.totalEspecies}
          icon={Fish}
          color="slate"
        />
        <StatsCard
          title="Variantes Activas"
          value={stats.totalVariantes}
          icon={Package}
          color="slate"
        />
        <StatsCard
          title="Ingresos (30 días)"
          value={stats.totalIngresos}
          icon={TrendingUp}
          color="zinc"
        />
        <StatsCard
          title="Salidas (30 días)"
          value={stats.totalSalidas}
          icon={TrendingDown}
          color="zinc"
        />
      </div>

      {/* Grid de stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatsCard
          title="Stock Crítico"
          value={stats.stockCritico}
          icon={AlertTriangle}
          color="slate"
          subtitle="Variantes con menos de 10 kg"
        />
        <StatsCard
          title="Stock Normal"
          value={stats.stockNormal}
          icon={CheckCircle}
          color="zinc"
          subtitle="Variantes con 10 kg o más"
        />
      </div>

      {/* Top 10 Variantes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-blue-950" />
          <h2 className="text-xl font-bold text-gray-900">
            Top 10 Variantes con Más Stock
          </h2>
        </div>

        {stats.top10Variantes.length > 0 ? (
          <div className="space-y-3">
            {stats.top10Variantes.map((variante, index) => (
              <div
                key={variante.variante_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-slate-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-600">
                      {variante.codigo_completo}
                    </p>
                    {/* 
                    <p className="text-xs text-gray-500">
                      {variante.especie_nombre} - {variante.presentacion_nombre}
                    </p>
                    */}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {variante.kg_stock.toFixed(2)} kg
                  </p>
                  <p className="text-xs text-gray-500">
                    {variante.cajas_stock} cajas
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No hay variantes con stock disponible
          </p>
        )}
      </div>

      {/* Resumen de movimientos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Últimos 5 Ingresos
            </h2>
          </div>

          {stats.ingresosUltimos30.length > 0 ? (
            <div className="space-y-2">
              {stats.ingresosUltimos30.slice(0, 5).map((ingreso) => (
                <div
                  key={ingreso.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ingreso.fecha}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      +{ingreso.kg} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {ingreso.cajas || 0} cajas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay ingresos recientes
            </p>
          )}
        </div>

        {/* Salidas recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Últimas 5 Salidas
            </h2>
          </div>

          {stats.salidasUltimas30.length > 0 ? (
            <div className="space-y-2">
              {stats.salidasUltimas30.slice(0, 5).map((salida) => (
                <div
                  key={salida.id}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {salida.fecha}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      -{salida.kg} kg
                    </p>
                    <p className="text-xs text-gray-500">
                      {salida.cajas || 0} cajas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay salidas recientes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
