import { AlertTriangle, Check, Clock, XOctagon } from "lucide-react";
import PropTypes from "prop-types";

const VARIANTES = {
  neutral: {
    clases: "border-line bg-gray-50 text-ink-muted",
    icono: null,
  },
  ok: {
    clases: "border-ok bg-ok-bg text-ok",
    icono: Check,
  },
  warn: {
    clases: "border-warn-line bg-warn-bg text-warn",
    icono: AlertTriangle,
  },
  crit: {
    clases: "border-crit bg-crit-bg text-crit",
    icono: XOctagon,
  },
  pendiente: {
    clases: "border-steel bg-navy-bg text-navy",
    icono: Clock,
  },
};

export const Badge = ({
  children,
  variant = "neutral",
  icon,
  className = "",
  ...props
}) => {
  const config = VARIANTES[variant] ?? VARIANTES.neutral;
  const Icon = icon === undefined ? config.icono : icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium tracking-[0.06em] uppercase ${config.clases} ${className}`.trim()}
      {...props}
    >
      {Icon && <Icon size={12} className="shrink-0" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["neutral", "ok", "warn", "crit", "pendiente"]),
  icon: PropTypes.elementType,
  className: PropTypes.string,
};
