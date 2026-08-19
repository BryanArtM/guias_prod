import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Ship, User } from "lucide-react";
import { useAuthStore } from "@/stores";
import {
  PageActionsOutlet,
  PageActionsProvider,
} from "@/components/common/PageActions";
import { NAV_GROUPS, resolverTituloPagina } from "@/components/navigation";
import PropTypes from "prop-types";

const FORMATO_RELOJ = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const Reloj = () => {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className="num text-xs text-ink-muted" dateTime={ahora.toISOString()}>
      {FORMATO_RELOJ.format(ahora)}
    </time>
  );
};

const NavItem = ({ item, activo }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      aria-current={activo ? "page" : undefined}
      className={`flex h-8 items-center gap-2.5 border-l-[3px] pr-3 pl-3.5 text-sm transition-colors ${
        activo
          ? "border-l-white bg-navy-hover font-medium text-white"
          : "border-l-transparent text-navy-text hover:bg-navy-hover hover:text-white"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
};

NavItem.propTypes = {
  item: PropTypes.shape({
    path: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
  }).isRequired,
  activo: PropTypes.bool.isRequired,
};

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const esActivo = (path) =>
    location.pathname === path ||
    (path === "/dashboard" && location.pathname === "/");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <PageActionsProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <aside className="flex w-[228px] shrink-0 flex-col border-r border-navy-line bg-navy">
          <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-navy-line px-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-steel text-navy-text">
              <Ship size={16} strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-white">
                SISTEMA PESQUERO
              </span>
              <span className="label-col block truncate text-navy-label">
                Control de Producción
              </span>
            </span>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {NAV_GROUPS.map((grupo, indice) => (
              <div key={grupo.label ?? `grupo-${indice}`}>
                {grupo.label && (
                  <h2 className="label-col mt-4 mb-1 px-3.5 text-navy-label">
                    {grupo.label}
                  </h2>
                )}
                {grupo.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    activo={esActivo(item.path)}
                  />
                ))}
              </div>
            ))}
          </nav>

          <div className="shrink-0 border-t border-navy-line px-3.5 py-3">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-steel text-navy-text">
                <User size={15} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white">
                  {user?.username}
                </span>
                <span className="block truncate text-xs text-navy-label">
                  {user?.email}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 border border-steel px-3 py-1.5 text-sm text-navy-text transition-colors hover:bg-navy-hover hover:text-white"
            >
              <LogOut size={14} strokeWidth={1.75} />
              Cerrar sesión
            </button>
            <p className="num mt-3 text-center text-xs text-navy-label">
              v2.0.0
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface px-5">
            <h1 className="truncate text-base font-semibold text-ink">
              {resolverTituloPagina(location.pathname)}
            </h1>
            <PageActionsOutlet className="ml-auto" />
            <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
            <Reloj />
          </header>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PageActionsProvider>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
