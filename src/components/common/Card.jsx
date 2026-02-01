import PropTypes from "prop-types";
import "./Card.css";

/**
 * Componente Card reutilizable para contenedores
 * <Card variant="elevated" padding="lg">
 *   <h2>Título</h2>
 *   <p>Contenido de la tarjeta</p>
 * </Card>
 */
export const Card = ({
  children,
  variant = "elevated",
  padding = "md",
  hover = false,
  className = "",
  onClick,
  ...props
}) => {
  const baseClass = "card";
  const variantClass = `card--${variant}`;
  const paddingClass = `card--padding-${padding}`;
  const hoverClass = hover ? "card--hoverable" : "";
  const clickableClass = onClick ? "card--clickable" : "";

  const classes =
    `${baseClass} ${variantClass} ${paddingClass} ${hoverClass} ${clickableClass} ${className}`.trim();

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={classes}
      onClick={onClick}
      type={onClick ? "button" : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["elevated", "outlined", "flat"]),
  padding: PropTypes.oneOf(["none", "sm", "md", "lg", "xl"]),
  hover: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
