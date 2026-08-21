import PropTypes from "prop-types";

const ESTADOS = {
  neutral: "text-ink",
  ok: "text-ok",
  warn: "text-warn",
  crit: "text-crit",
};

export const StatCard = ({
  label,
  value,
  unit,
  icon: Icon,
  estado = "neutral",
  nota,
  className = "",
}) => (
  <div
    className={`flex items-start justify-between gap-3 rounded-sm border border-line bg-surface px-3 py-2.5 ${className}`.trim()}
  >
    <div className="min-w-0">
      <p className="label-col truncate">{label}</p>
      <p className="mt-1.5 flex items-baseline gap-1">
        <span className={`num text-3xl leading-none font-medium ${ESTADOS[estado]}`}>
          {value}
        </span>
        {unit && <span className="text-xs text-ink-faint">{unit}</span>}
      </p>
      {nota && <p className="mt-1.5 truncate text-xs text-ink-muted">{nota}</p>}
    </div>
    {Icon && (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-line text-steel">
        <Icon size={16} />
      </span>
    )}
  </div>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  icon: PropTypes.elementType,
  estado: PropTypes.oneOf(["neutral", "ok", "warn", "crit"]),
  nota: PropTypes.node,
  className: PropTypes.string,
};
