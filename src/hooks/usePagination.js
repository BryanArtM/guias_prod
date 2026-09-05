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
  const [cargando, setCargando] = useState(false);
  // Permite que la vista muestre el spinner completo solo la primera vez, y
  // que los cambios de pagina se resuelvan sin desmontar el listado.
  const [cargaInicial, setCargaInicial] = useState(true);
  const [error, setError] = useState(null);

  // Al cambiar los filtros (fetchFn y countFn cambian de identidad) o el tamano
  // de pagina hay que volver a la primera: el offset anterior puede caer fuera
  // del nuevo total y dejar la tabla vacia aunque si haya resultados. Se ajusta
  // durante el render para que la carga salga ya con el offset correcto, en vez
  // de pedir una pagina con el offset viejo y otra despues del reset.
  const [consultaAnterior, setConsultaAnterior] = useState(() => ({
    fetchFn,
    countFn,
    itemsPerPage,
  }));

  if (
    consultaAnterior.fetchFn !== fetchFn ||
    consultaAnterior.countFn !== countFn ||
    consultaAnterior.itemsPerPage !== itemsPerPage
  ) {
    setConsultaAnterior({ fetchFn, countFn, itemsPerPage });
    setPaginaActual(1);
  }

  // Calcular offset basado en página actual
  const offset = (paginaActual - 1) * itemsPerPage;
  const totalPaginas = Math.ceil(totalItems / itemsPerPage);

  // Los items dependen de la pagina; el total, solo de los filtros. Van por
  // separado para no recontar toda la tabla en cada avance de pagina.
  const cargarPagina = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      setData(await fetchFn(itemsPerPage, offset));
    } catch (err) {
      setError(err.message || "Error al cargar datos");
      console.error("Error en usePagination:", err);
    } finally {
      setCargando(false);
      setCargaInicial(false);
    }
  }, [fetchFn, itemsPerPage, offset]);

  const cargarTotal = useCallback(async () => {
    try {
      setTotalItems(await countFn());
    } catch (err) {
      setError(err.message || "Error al contar los registros");
      console.error("Error en usePagination:", err);
    }
  }, [countFn]);

  // Cargar la pagina al cambiar de pagina, de tamano o de filtros
  useEffect(() => {
    cargarPagina();
  }, [cargarPagina]);

  // Recontar solo cuando cambian los filtros
  useEffect(() => {
    cargarTotal();
  }, [cargarTotal]);

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

  // Tras crear o eliminar un registro hay que rehacer ambas consultas
  const refrescar = () => {
    cargarPagina();
    cargarTotal();
  };

  return {
    // Datos
    data,
    cargando,
    cargaInicial,
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
