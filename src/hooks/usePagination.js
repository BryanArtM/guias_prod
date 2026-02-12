import { useState, useEffect, useCallback } from "react";

/**
 * Hook personalizado para paginación de datos
 * @param {Function} fetchFn - Función async para obtener datos paginados (limite, offset)
 * @param {Function} countFn - Función async para contar total de registros
 * @param {number} itemsPerPage - Cantidad de items por página (default: 5)
 * @returns {Object} - Estado y funciones de paginación
 */
export function usePagination(fetchFn, countFn, itemsPerPage = 5) {
  const [data, setData] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // Calcular offset basado en página actual
  const offset = (paginaActual - 1) * itemsPerPage;

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      const [items, total] = await Promise.all([
        fetchFn(itemsPerPage, offset),
        countFn(),
      ]);

      setData(items);
      setTotalItems(total);
      setTotalPaginas(Math.ceil(total / itemsPerPage));
    } catch (err) {
      setError(err.message || "Error al cargar datos");
      console.error("Error en usePagination:", err);
    } finally {
      setCargando(false);
    }
  }, [fetchFn, countFn, itemsPerPage, offset]);

  // Cargar datos cuando cambia la página
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Navegación
  const irAPagina = (pagina) => {
    const nuevaPagina = Math.max(1, Math.min(pagina, totalPaginas));
    setPaginaActual(nuevaPagina);
  };

  const paginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      setPaginaActual((prev) => prev + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual((prev) => prev - 1);
    }
  };

  const refrescar = () => {
    cargarDatos();
  };

  return {
    // Datos
    data,
    cargando,
    error,

    // Paginación
    paginaActual,
    totalPaginas,
    totalItems,
    itemsPerPage,

    // Navegación
    irAPagina,
    paginaSiguiente,
    paginaAnterior,
    refrescar,

    // Helpers
    hayPaginaAnterior: paginaActual > 1,
    hayPaginaSiguiente: paginaActual < totalPaginas,
    rangoActual: {
      inicio: offset + 1,
      fin: Math.min(offset + itemsPerPage, totalItems),
    },
  };
}
