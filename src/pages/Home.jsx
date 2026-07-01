import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp, Fish, BarChart3 } from "lucide-react";
import { Card } from "@/components/common";
export const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente al dashboard
    navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="space-y-6">
      <Card
        padding="lg"
        className="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Salidas Hoy</p>
            <h3 className="text-3xl font-bold mt-1">-</h3>
          </div>
          <ArrowDown size={40} className="text-orange-200" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Fish className="text-blue-600" />
              Jerarquía del Sistema
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="pl-4 border-l-4 border-blue-500">
                <h3 className="font-semibold text-lg">1. Especies</h3>
                <p className="text-sm text-gray-600">
                  PERICO, CALAMAR, POTA - El producto base
                </p>
              </div>
              <div className="pl-4 border-l-4 border-green-500">
                <h3 className="font-semibold text-lg">2. Presentaciones</h3>
                <p className="text-sm text-gray-600">
                  LOMO, FILETE, TENTÁCULO, ALETA - Partes del producto
                </p>
              </div>
              <div className="pl-4 border-l-4 border-purple-500">
                <h3 className="font-semibold text-lg">3. Variantes</h3>
                <p className="text-sm text-gray-600">
                  Combinación de presentación + envasado + empacado + ensunchado
                  + calidad + calibre
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  Ejemplo: PERICO LOMO IQF IWP Z H 8-16
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="text-green-600" />
              Movimientos de Inventario
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <ArrowUp size={20} />
                  Ingresos
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 ml-7">
                  <li>• Por Producción</li>
                  <li>• Por Orden de Desembarque</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                  <ArrowDown size={20} />
                  Salidas
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 ml-7">
                  <li>• Por Muestreo de Calidad</li>
                  <li>• Por Embarque</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card padding="lg">
          <div className="text-center text-gray-600">
            <h3 className="text-xl font-semibold mb-2">
              ¡Bienvenido al Sistema!
            </h3>
            <p>
              Utiliza el menú lateral para navegar entre las diferentes
              secciones del sistema.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Comienza registrando especies, luego presentaciones, y finalmente
              crea las variantes de productos.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
