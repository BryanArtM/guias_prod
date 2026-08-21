import PropTypes from "prop-types";

const RELLENOS = {
  neutral: "bg-steel",
  ok: "bg-ok",
  warn: "bg-warn-line",
  crit: "bg-crit",
};

export const ProgressBar = ({
  value,
  max = 100,
  label,
  estado = "neutral",
  mostrarValor = true,
  className = "",
}) => {
  const porcentaje = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={className}>
      {(label || mostrarValor) && (
        <div className="mb-1 flex items-baseline justify-between gap-2">
          {label && <span className="label-col truncate">{label}</span>}
          {mostrarValor && (
            <span className="num text-xs text-ink-muted">
              {Math.round(porcentaje)}%
            </span>
          )}
        </div>
      )}
      <div
        className="h-1.5 border border-line bg-gray-50 rounded-sm"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`h-full ${RELLENOS[estado]}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  estado: PropTypes.oneOf(["neutral", "ok", "warn", "crit"]),
  mostrarValor: PropTypes.bool,
  className: PropTypes.string,
};
