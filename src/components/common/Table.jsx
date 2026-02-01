import PropTypes from "prop-types";
import "./Table.css";

/**
 * Componente Table reutilizable con estilos consistentes
 * <Table
 *   columns={[
 *     { key: 'codigo', header: 'Código', align: 'left' },
 *     { key: 'nombre', header: 'Nombre', align: 'left' },
 *     { key: 'acciones', header: 'Acciones', align: 'right' }
 *   ]}
 *   data={productos}
 *   renderRow={(producto) => (
 *     <>
 *       <td>{producto.codigo}</td>
 *       <td>{producto.nombre}</td>
 *       <td>...</td>
 *     </>
 *   )}
 * />
 */
export const Table = ({
  columns,
  data,
  renderRow,
  hover = true,
  striped = false,
  bordered = false,
  compact = false,
  className = "",
}) => {
  const tableClass = [
    "table",
    hover && "table--hover",
    striped && "table--striped",
    bordered && "table--bordered",
    compact && "table--compact",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table-wrapper">
      <table className={tableClass}>
        <thead className="table__head">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`table__header table__header--${column.align || "left"}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table__body">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id || index} className="table__row">
                {renderRow(item, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      width: PropTypes.string,
    }),
  ).isRequired,
  data: PropTypes.array.isRequired,
  renderRow: PropTypes.func.isRequired,
  hover: PropTypes.bool,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
};
