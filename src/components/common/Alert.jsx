import PropTypes from "prop-types";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import "./Alert.css";

/**
 * Componente Alert reutilizable para mostrar mensajes
 * <Alert variant="error" onClose={() => setError(null)}>
 *   Ha ocurrido un error al guardar
 * </Alert>
 */
export const Alert = ({
  children,
  variant = "info",
  title,
  onClose,
  icon: customIcon,
  className = "",
}) => {
  const icons = {
    error: <AlertCircle size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  const icon = customIcon || icons[variant];
  const classes = `alert alert--${variant} ${className}`.trim();

  return (
    <div className={classes} role="alert">
      <div className="alert__icon">{icon}</div>

      <div className="alert__content">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert__close"
          aria-label="Cerrar alerta"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["error", "success", "warning", "info"]),
  title: PropTypes.string,
  onClose: PropTypes.func,
  icon: PropTypes.node,
  className: PropTypes.string,
};
