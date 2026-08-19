import PropTypes from "prop-types";

/** Panel recto con encabezado de seccion y hueco de acciones a la derecha. */
export const Panel = ({
  title,
  actions,
  children,
  padding = "md",
  className = "",
}) => {
  const paddings = { none: "", sm: "p-2", md: "p-3", lg: "p-4" };

  return (
    <section
      className={`border border-line bg-surface ${className}`.trim()}
    >
      {(title || actions) && (
        <header className="flex min-h-9 items-center justify-between gap-3 border-b border-line px-3 py-1.5">
          {title && <h2 className="label-col truncate">{title}</h2>}
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={paddings[padding]}>{children}</div>
    </section>
  );
};

Panel.propTypes = {
  title: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  padding: PropTypes.oneOf(["none", "sm", "md", "lg"]),
  className: PropTypes.string,
};
