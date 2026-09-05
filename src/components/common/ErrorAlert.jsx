import PropTypes from "prop-types";
import { Alert } from "./Alert";

/**
 * Alerta de error con el mensaje ya traducido a algo accionable. El texto crudo
 * del backend queda en un desplegable: no estorba, pero sigue a mano para
 * reportar el problema.
 *
 * Acepta tanto la descripcion que arma describirError() como una cadena suelta,
 * que es lo que producen las validaciones de los formularios.
 */
export const ErrorAlert = ({ error, className = "", onClose }) => {
  if (!error) return null;

  // Una cadena suelta puede ser tanto una validacion como un error de carga ya
  // compuesto, asi que se muestra sin titulo en vez de inventarle uno.
  const esTexto = typeof error === "string";
  const titulo = esTexto ? undefined : error.titulo;
  const mensaje = esTexto ? error : error.mensaje;
  const detalle = esTexto ? null : error.detalle;

  return (
    <Alert variant="error" title={titulo} className={className} onClose={onClose}>
      {mensaje}
      {detalle && (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-xs opacity-75">
            Detalle técnico
          </summary>
          <p className="num mt-1 text-xs break-all opacity-75">{detalle}</p>
        </details>
      )}
    </Alert>
  );
};

ErrorAlert.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      titulo: PropTypes.string,
      mensaje: PropTypes.string,
      detalle: PropTypes.string,
    }),
  ]),
  className: PropTypes.string,
  onClose: PropTypes.func,
};
