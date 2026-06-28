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
  Anchor,
} from "lucide-react";
import { useAuthStore } from "@/stores";
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar Profesional */}
      <aside
        className="w-64 flex flex-col bg-white border-r border-gray-200"
        style={{
          boxShadow: "2px 0 8px rgba(15, 23, 42, 0.08)",
        }}
      >
        {/* Header Corporativo */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-900 to-blue-800">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white"
              style={{
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              <Anchor size={24} className="text-blue-900" />
            </div>
            <div>
              <h1
                className="text-sm font-bold text-white leading-tight tracking-tight"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                SISTEMA PESQUERO
              </h1>
              <p className="text-xs text-blue-200 font-medium">
                Control de Producción
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/dashboard") || isActive("/")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home size={18} />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>

          <div className="mt-5 mb-2 px-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Catálogos
            </h3>
            <div className="mt-2 h-px bg-gray-200" />
          </div>

          <Link
            to="/especies"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/especies")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Fish size={18} />
            <span className="font-medium text-sm">Especies</span>
          </Link>

          <Link
            to="/presentaciones"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/presentaciones")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Box size={18} />
            <span className="font-medium text-sm">Presentaciones</span>
          </Link>

          <Link
            to="/variantes"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/variantes")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Package size={18} />
            <span className="font-medium text-sm">Variantes</span>
          </Link>

          <Link
            to="/catalogos"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/catalogos")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Archive size={18} />
            <span className="font-medium text-sm">Otros Catálogos</span>
          </Link>

          <div className="mt-5 mb-2 px-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Documentos de Ingreso
            </h3>
            <div className="mt-2 h-px bg-gray-200" />
          </div>

          <Link
            to="/partes/nuevo" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 
              ${location.pathname === "/partes/nuevo" 
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={18} />
            <span className="font-medium text-sm">Generar Documento</span>
          </Link>

          <div className="mt-5 mb-2 px-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Movimientos
            </h3>
            <div className="mt-2 h-px bg-gray-200" />
          </div>

          <Link
            to="/ingresos"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/ingresos")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowUp size={18} />
            <span className="font-medium text-sm">Ingresos</span>
          </Link>

          <Link
            to="/salidas"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/salidas")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <ArrowDown size={18} />
            <span className="font-medium text-sm">Salidas</span>
          </Link>

          <div className="mt-5 mb-2 px-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Consultas
            </h3>
            <div className="mt-2 h-px bg-gray-200" />
          </div>

          <Link
            to="/stock"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/stock")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <BarChart3 size={18} />
            <span className="font-medium text-sm">Stock Actual</span>
          </Link>

          <Link
            to="/reportes"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
              isActive("/reportes")
                ? "bg-blue-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FileText size={18} />
            <span className="font-medium text-sm">Reportes</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100">
              <User size={18} className="text-blue-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          >
            <LogOut size={16} className="text-gray-700" />
            <span className="text-sm font-medium text-gray-700">
              Cerrar Sesión
            </span>
          </button>
          <p className="text-xs text-gray-400 text-center mt-3 font-mono">
            v2.0.0 | 2026
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
