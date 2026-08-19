import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";


const SlotContext = createContext(null);

export const PageActionsProvider = ({ children }) => {
  const [contenedor, setContenedor] = useState(null);

  return (
    <SlotContext.Provider value={{ contenedor, setContenedor }}>
      {children}
    </SlotContext.Provider>
  );
};

PageActionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Punto de montaje. Se renderiza una sola vez, dentro del header. */
export const PageActionsOutlet = ({ className = "" }) => {
  const slot = useContext(SlotContext);

  return (
    <div
      ref={slot?.setContenedor}
      className={`flex items-center gap-2 ${className}`.trim()}
    />
  );
};

PageActionsOutlet.propTypes = {
  className: PropTypes.string,
};

/** Envuelve los botones de accion de una pantalla para subirlos al header. */
export const PageActions = ({ children }) => {
  const slot = useContext(SlotContext);

  if (!slot?.contenedor) return null;

  return createPortal(children, slot.contenedor);
};

PageActions.propTypes = {
  children: PropTypes.node.isRequired,
};
