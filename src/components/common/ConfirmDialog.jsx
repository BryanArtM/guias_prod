import PropTypes from "prop-types";
import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * Dialogo de confirmacion del sistema, en reemplazo de window.confirm.
 * Normalmente se usa a traves del hook useConfirmacion, que lo conecta con una
 * promesa; tambien puede montarse directo controlando `abierto` a mano.
 */
export const ConfirmDialog = ({
  abierto,
  titulo = "Confirmar acción",
  mensaje,
  detalle,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  variante = "danger",
  onConfirmar,
  onCancelar,
}) => (
  <Modal isOpen={abierto} onClose={onCancelar} title={titulo} size="sm">
    <p className="text-sm text-ink">{mensaje}</p>
    {detalle && <p className="mt-2 text-xs text-ink-muted">{detalle}</p>}
    <div className="mt-4 flex justify-end gap-2">
      <Button type="button" variant="secondary" onClick={onCancelar}>
        {textoCancelar}
      </Button>
      <Button type="button" variant={variante} onClick={onConfirmar} autoFocus>
        {textoConfirmar}
      </Button>
    </div>
  </Modal>
);

ConfirmDialog.propTypes = {
  abierto: PropTypes.bool.isRequired,
  titulo: PropTypes.string,
  mensaje: PropTypes.node,
  detalle: PropTypes.node,
  textoConfirmar: PropTypes.string,
  textoCancelar: PropTypes.string,
  variante: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "ghost",
  ]),
  onConfirmar: PropTypes.func.isRequired,
  onCancelar: PropTypes.func.isRequired,
};
