import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  Home,
  LogOut,
  User,
  Fish,
  Box,
  Archive,
  ArrowUp,
  ArrowDown,
  BarChart3,
  FileText,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import PropTypes from "prop-types";

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Inventario Producción</h1>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/dashboard") || isActive("/")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <div className="mt-4 mb-2 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Catálogos
            </h3>
          </div>

          <Link
            to="/especies"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/especies")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Fish size={20} />
            <span className="font-medium">Especies</span>
          </Link>

          <Link
            to="/presentaciones"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/presentaciones")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Box size={20} />
            <span className="font-medium">Presentaciones</span>
          </Link>

          <Link
            to="/variantes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/variantes")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Package size={20} />
            <span className="font-medium">Variantes</span>
          </Link>

          <Link
            to="/catalogos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/catalogos")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Archive size={20} />
            <span className="font-medium">Otros Catálogos</span>
          </Link>

          <div className="mt-4 mb-2 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Movimientos
            </h3>
          </div>

          <Link
            to="/ingresos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/ingresos")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <ArrowUp size={20} />
            <span className="font-medium">Ingresos</span>
          </Link>

          <Link
            to="/salidas"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/salidas")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <ArrowDown size={20} />
            <span className="font-medium">Salidas</span>
          </Link>

          <div className="mt-4 mb-2 px-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Consultas
            </h3>
          </div>

          <Link
            to="/stock"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/stock")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Stock Actual</span>
          </Link>

          <Link
            to="/reportes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/reportes")
                ? "bg-cyan-900 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FileText size={20} />
            <span className="font-medium">Reportes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="bg-cyan-900 p-2 rounded-full">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-3">
            Sistema de Gestión v2.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
