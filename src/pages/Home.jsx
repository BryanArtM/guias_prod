import { Link } from "react-router-dom";
import { Package, FileText, TrendingUp, User } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { Card } from "../components/common";

export const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-3 rounded-full">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              Bienvenido, {user?.username}!
            </h1>
            <p className="text-gray-600 text-lg">
              Sistema de gestión para planta de conservas
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/productos" className="block">
          <Card hover className="h-full">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <Package size={32} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Productos
                </h2>
                <p className="text-gray-600 mb-4">
                  Gestiona el catálogo completo de productos. Añade, edita y
                  elimina productos con sus códigos, unidades y descripciones.
                </p>
                <div className="text-blue-600 font-medium">
                  Ir a Productos →
                </div>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/guias" className="block">
          <Card hover className="h-full">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <FileText size={32} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Guías de Producción
                </h2>
                <p className="text-gray-600 mb-4">
                  Crea y gestiona guías de producción. Selecciona productos,
                  genera PDFs e imprime documentos de manera eficiente.
                </p>
                <div className="text-green-600 font-medium">Ir a Guías →</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
