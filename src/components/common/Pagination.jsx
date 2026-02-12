import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "./Pagination.css";

/**
 * Componente de paginación reutilizable
 */
export default function Pagination({
  paginaActual = 1,
  totalPaginas = 1,
  totalItems = 0,
  itemsPerPage = 5,
  rangoActual = { inicio: 0, fin: 0 },
  onPaginaAnterior,
  onPaginaSiguiente,
  onIrAPagina,
  hayPaginaAnterior = false,
  hayPaginaSiguiente = false,
  mostrarPrimerUltimo = true,
}) {
  if (totalPaginas <= 1) return null;

  const inicioCalculado =
    totalItems === 0 ? 0 : (paginaActual - 1) * itemsPerPage + 1;
  const finCalculado =
    totalItems === 0 ? 0 : Math.min(paginaActual * itemsPerPage, totalItems);

  const inicioMostrado =
    typeof rangoActual?.inicio === "number" && rangoActual.inicio > 0
      ? rangoActual.inicio
      : inicioCalculado;
  const finMostrado =
    typeof rangoActual?.fin === "number" && rangoActual.fin > 0
      ? rangoActual.fin
      : finCalculado;

  // Generar array de números de página para mostrar
  const generarNumerosPagina = () => {
    const maxVisible = 5;
    const numeros = [];

    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2));
    let fin = Math.min(totalPaginas, inicio + maxVisible - 1);

    // Ajustar inicio si estamos cerca del final
    if (fin - inicio < maxVisible - 1) {
      inicio = Math.max(1, fin - maxVisible + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i);
    }

    return numeros;
  };

  const numerosPagina = generarNumerosPagina();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-text">
          Mostrando <strong>{inicioMostrado}</strong> -{" "}
          <strong>{finMostrado}</strong> de <strong>{totalItems}</strong>{" "}
          registros
        </span>
      </div>

      <div className="pagination-controls">
        {/* Primera página */}
        {mostrarPrimerUltimo && paginaActual > 2 && (
          <button
            className="pagination-btn"
            onClick={() => onIrAPagina(1)}
            title="Primera página"
          >
            <ChevronsLeft size={18} />
          </button>
        )}

        {/* Página anterior */}
        <button
          className="pagination-btn"
          onClick={onPaginaAnterior}
          disabled={!hayPaginaAnterior}
          title="Página anterior"
        >
          <ChevronLeft size={18} />
          <span className="pagination-btn-text">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="pagination-numbers">
          {numerosPagina.map((num) => (
            <button
              key={num}
              className={`pagination-number ${num === paginaActual ? "active" : ""}`}
              onClick={() => onIrAPagina(num)}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Página siguiente */}
        <button
          className="pagination-btn"
          onClick={onPaginaSiguiente}
          disabled={!hayPaginaSiguiente}
          title="Página siguiente"
        >
          <span className="pagination-btn-text">Siguiente</span>
          <ChevronRight size={18} />
        </button>

        {/* Última página */}
        {mostrarPrimerUltimo && paginaActual < totalPaginas - 1 && (
          <button
            className="pagination-btn"
            onClick={() => onIrAPagina(totalPaginas)}
            title="Última página"
          >
            <ChevronsRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
