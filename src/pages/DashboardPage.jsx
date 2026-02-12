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
import { StatsCard } from "@/components/dashboard";
import { Loading, Alert } from "@/components/common";
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
    return <Loading mensaje="Cargando estadísticas..." />;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-blue-900 rounded-full" />
          <div>
            <h1 
              className="text-3xl font-bold text-gray-900"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Panel de Control
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitoreo y gestión de producción pesquera en tiempo real
            </p>
          </div>
        </div>
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
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
            <BarChart3 className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Top 10 Variantes con Mayor Stock
            </h2>
            <p className="text-xs text-gray-500">Productos con mayor inventario disponible</p>
          </div>
        </div>

        {stats.top10Variantes.length > 0 ? (
          <div className="space-y-2">
            {stats.top10Variantes.map((variante, index) => (
              <div
                key={variante.variante_id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                      index < 3 
                        ? 'bg-blue-900 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      {variante.codigo_completo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
          <p className="text-gray-500 text-center py-12">
            No hay variantes con stock disponible
          </p>
        )}
      </div>

      {/* Resumen de movimientos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50">
              <TrendingUp className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Últimos 5 Ingresos
              </h2>
              <p className="text-xs text-gray-500">Entradas recientes al inventario</p>
            </div>
          </div>

          {stats.ingresosUltimos30.length > 0 ? (
            <div className="space-y-2">
              {stats.ingresosUltimos30.slice(0, 5).map((ingreso) => (
                <div
                  key={ingreso.id}
                  className="flex justify-between items-center py-3 px-3 rounded-lg border border-gray-100 hover:bg-green-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      {ingreso.fecha}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">
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
            <p className="text-gray-500 text-center py-8">
              No hay ingresos recientes
            </p>
          )}
        </div>

        {/* Salidas recientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
              <TrendingDown className="w-5 h-5 text-red-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Últimas 5 Salidas
              </h2>
              <p className="text-xs text-gray-500">Despachos recientes de inventario</p>
            </div>
          </div>

          {stats.salidasUltimas30.length > 0 ? (
            <div className="space-y-2">
              {stats.salidasUltimas30.slice(0, 5).map((salida) => (
                <div
                  key={salida.id}
                  className="flex justify-between items-center py-3 px-3 rounded-lg border border-gray-100 hover:bg-red-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      {salida.fecha}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-700">
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
            <p className="text-gray-500 text-center py-8">
              No hay salidas recientes
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
