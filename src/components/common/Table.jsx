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

// ============ COMPONENTES MODULARES PARA TABLAS ============

/**
 * Componentes modulares para construir tablas de forma más flexible
 * Uso:
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Columna 1</TableHead>
 *       <TableHead>Columna 2</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>Dato 1</TableCell>
 *       <TableCell>Dato 2</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */

export const TableModular = ({ children, className = "" }) => {
  return (
    <div className="table-wrapper">
      <table className={`table table--hover ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return <thead className="table__head">{children}</thead>;
};

export const TableBody = ({ children }) => {
  return <tbody className="table__body">{children}</tbody>;
};

export const TableRow = ({ children, className = "" }) => {
  return <tr className={`table__row ${className}`}>{children}</tr>;
};

export const TableHead = ({ children, className = "", ...props }) => {
  return (
    <th className={`table__header ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = "", ...props }) => {
  return (
    <td className={`${className}`} {...props}>
      {children}
    </td>
  );
};
