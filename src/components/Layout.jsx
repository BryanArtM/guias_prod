import { Link, useLocation, useNavigate } from "react-router-dom";
import { Package, FileText, Home, LogOut, User } from "lucide-react";
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
          <h1 className="text-2xl font-bold">Guías Producción</h1>
          <p className="text-sm text-gray-400 mt-1">Sistema de Gestión</p>
        </div>

        <nav className="flex-1 p-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Home size={20} />
            <span className="font-medium">Inicio</span>
          </Link>

          <Link
            to="/productos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/productos")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Package size={20} />
            <span className="font-medium">Productos</span>
          </Link>

          <Link
            to="/guias"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
              isActive("/guias")
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            <FileText size={20} />
            <span className="font-medium">Guías</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="bg-blue-600 p-2 rounded-full">
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
            Sistema de Gestión v1.0
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
