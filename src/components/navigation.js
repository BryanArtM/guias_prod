import {
  Gauge,
  Fish,
  Package,
  Boxes,
  Settings2,
  Building2,
  ClipboardList,
  ClipboardCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Snowflake,
  FileText,
} from "lucide-react";


export const NAV_GROUPS = [
  {
    label: null,
    items: [{ path: "/dashboard", label: "Dashboard", icon: Gauge }],
  },
  {
    label: "Catálogos",
    items: [
      { path: "/clientes", label: "Clientes", icon: Building2 },
      { path: "/especies", label: "Especies", icon: Fish },
      { path: "/presentaciones", label: "Presentaciones", icon: Package },
      { path: "/variantes", label: "Variantes", icon: Boxes },
      { path: "/catalogos", label: "Otros Catálogos", icon: Settings2 },
    ],
  },
  {
    label: "Documentos de Ingreso",
    items: [
      { path: "/partes/nuevo", label: "Nuevo Ingreso", icon: ClipboardList },
    ],
  },
  {
    label: "Documentos de Salida",
    items: [
      { path: "/control/nuevo", label: "Nueva Salida", icon: ClipboardCheck },
    ],
  },
  {
    label: "Movimientos",
    items: [
      { path: "/ingresos", label: "Ingresos", icon: ArrowDownToLine },
      { path: "/salidas", label: "Salidas", icon: ArrowUpFromLine },
    ],
  },
  {
    label: "Consultas",
    items: [
      { path: "/stock", label: "Stock Actual", icon: Snowflake },
      { path: "/reportes", label: "Reportes", icon: FileText },
    ],
  },
];

/** Rutas que no aparecen en el sidebar pero necesitan titulo en el header. */
const TITULOS_EXTRA = [
  { patron: /^\/ingresos\/\d+\/editar$/, titulo: "Editar Ingreso" },
  { patron: /^\/ingresos\/\d+$/, titulo: "Detalle de Ingreso" },
  { patron: /^\/salidas\/\d+\/editar$/, titulo: "Editar Salida" },
  { patron: /^\/salidas\/\d+$/, titulo: "Detalle de Salida" },
];

const ITEMS = NAV_GROUPS.flatMap((grupo) => grupo.items);

/** Titulo de pagina para el header compacto, resuelto desde la ruta activa. */
export const resolverTituloPagina = (pathname) => {
  if (pathname === "/") return "Dashboard";

  const item = ITEMS.find((i) => i.path === pathname);
  if (item) return item.label;

  const extra = TITULOS_EXTRA.find((e) => e.patron.test(pathname));
  return extra ? extra.titulo : "Sistema Pesquero";
};
