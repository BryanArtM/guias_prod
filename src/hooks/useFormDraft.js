import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Elimina un borrador guardado sin necesidad de montar el hook.
 * Se usa, por ejemplo, cuando el documento ya se guardó en el servidor.
 */
export function limpiarBorradorGuardado(storageKey) {
  if (!storageKey) return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("No se pudo eliminar el borrador guardado:", error);
  }
}

/**
 * Estado de formulario con borrador persistido en localStorage.
 * Permite salir de la vista de registro y retomarla con los datos ya cargados.
 * Si `storageKey` es null o undefined se comporta como un useState normal
 * (por ejemplo al editar un documento existente, donde no interesa el borrador).
 *
 * Devuelve [valor, setValor, reiniciar], donde `reiniciar` borra el borrador y
 * vuelve al valor inicial, o al valor que se le pase como argumento.
 */
export function useFormDraft(storageKey, valorInicial) {
  const valorInicialRef = useRef(valorInicial);

  const [valor, setValor] = useState(() => {
    if (!storageKey) return valorInicialRef.current;
    try {
      const guardado = window.localStorage.getItem(storageKey);
      return guardado ? JSON.parse(guardado) : valorInicialRef.current;
    } catch (error) {
      console.error("No se pudo leer el borrador guardado:", error);
      return valorInicialRef.current;
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(valor));
    } catch (error) {
      console.error("No se pudo guardar el borrador:", error);
    }
  }, [storageKey, valor]);

  const reiniciar = useCallback(
    (valorNuevo) => {
      limpiarBorradorGuardado(storageKey);
      setValor(valorNuevo === undefined ? valorInicialRef.current : valorNuevo);
    },
    [storageKey],
  );

  return [valor, setValor, reiniciar];
}
