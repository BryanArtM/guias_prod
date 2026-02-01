import PropTypes from "prop-types";
import "./Loading.css";

/**
 * Componente Loading/Spinner reutilizable
 * <Loading size="lg" text="Cargando datos..." />
 */
export const Loading = ({
  size = "md",
  variant = "primary",
  text,
  fullScreen = false,
  className = "",
}) => {
  const classes =
    `loading ${fullScreen ? "loading--fullscreen" : ""} ${className}`.trim();
  const spinnerClass = `loading__spinner loading__spinner--${size} loading__spinner--${variant}`;

  const content = (
    <>
      <div className={spinnerClass}>
        <div className="loading__spinner-circle"></div>
      </div>
      {text && <p className="loading__text">{text}</p>}
    </>
  );

  if (fullScreen) {
    return (
      <div className={classes}>
        <div className="loading__content">{content}</div>
      </div>
    );
  }

  return <div className={classes}>{content}</div>;
};

Loading.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  variant: PropTypes.oneOf(["primary", "secondary", "white"]),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};
