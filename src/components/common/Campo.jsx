import PropTypes from "prop-types";

/** Par etiqueta/valor de solo lectura, para las fichas de detalle. */
export const Campo = ({ etiqueta, valor, mono = false, className = "" }) => (
  <div className={className}>
    <p className="label-col mb-0.5">{etiqueta}</p>
    <p className={`text-sm font-medium text-ink ${mono ? "num" : ""}`.trim()}>
      {valor ?? "-"}
    </p>
  </div>
);

Campo.propTypes = {
  etiqueta: PropTypes.string.isRequired,
  valor: PropTypes.node,
  mono: PropTypes.bool,
  className: PropTypes.string,
};
