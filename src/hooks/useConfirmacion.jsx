import { useCallback, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

/**
 * Reemplazo de window.confirm con el dialogo del sistema.
 *
 * const [confirmar, dialogoConfirmacion] = useConfirmacion();
 *
 * const eliminar = async () => {
 *   const confirmado = await confirmar({
 *     titulo: "Eliminar registro",
 *     mensaje: "Esta accion no se puede deshacer.",
 *     textoConfirmar: "Sí, eliminar",
 *   });
 *   if (!confirmado) return;
 * };
 *
 * El componente debe renderizar {dialogoConfirmacion} dentro de su arbol.
 */
export function useConfirmacion() {
  const [opciones, setOpciones] = useState(null);
  const responderRef = useRef(null);

  const confirmar = useCallback((config = {}) => {
    setOpciones(config);
    return new Promise((resolver) => {
      responderRef.current = resolver;
    });
  }, []);

  // La promesa se resuelve una sola vez; cerrar el dialogo equivale a cancelar.
  const responder = (respuesta) => {
    setOpciones(null);
    const resolver = responderRef.current;
    responderRef.current = null;
    resolver?.(respuesta);
  };

  const dialogoConfirmacion = (
    <ConfirmDialog
      abierto={opciones !== null}
      titulo={opciones?.titulo}
      mensaje={opciones?.mensaje}
      detalle={opciones?.detalle}
      textoConfirmar={opciones?.textoConfirmar}
      textoCancelar={opciones?.textoCancelar}
      variante={opciones?.variante}
      onConfirmar={() => responder(true)}
      onCancelar={() => responder(false)}
    />
  );

  return [confirmar, dialogoConfirmacion];
}
