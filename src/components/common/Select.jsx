import { forwardRef } from "react";
import "./Select.css";

/**
 * @typedef {Object} SelectOption
 * @property {string|number} value - Valor de la opción
 * @property {string} label - Texto a mostrar
 * @property {boolean} [disabled] - Si la opción está deshabilitada
 */

/**
 * @typedef {Object} SelectProps
 * @property {string} [label] - Etiqueta del select
 * @property {string} [name] - Nombre del select
 * @property {string|number} [value] - Valor seleccionado
 * @property {function} [onChange] - Función callback para cambios
 * @property {function} [onBlur] - Función callback para blur
 * @property {Array<string|SelectOption>} options - Opciones del select
 * @property {string} [placeholder='Seleccione una opción'] - Texto placeholder
 * @property {string} [error] - Mensaje de error
 * @property {string} [helperText] - Texto de ayuda
 * @property {boolean} [disabled=false] - Deshabilitar el select
 * @property {boolean} [required=false] - Campo requerido
 * @property {boolean} [showRequiredIndicator] - Mostrar asterisco solo cuando corresponda
 * @property {boolean} [fullWidth=false] - Ocupar todo el ancho
 * @property {React.ReactNode} [icon] - Icono a mostrar
 * @property {string} [className=''] - Clases CSS adicionales
 */

/**
 * Componente Select reutilizable con soporte para opciones y estados
 * <Select
 *   label="Unidad de medida"
 *   name="unidad"
 *   value={unidad}
 *   onChange={(e) => setUnidad(e.target.value)}
 *   options={[
 *     { value: 'kg', label: 'Kilogramos' },
 *     { value: 'g', label: 'Gramos' }
 *   ]}
 * />
 */
export const Select = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      onBlur,
      options = [],
      placeholder = "Seleccione una opción",
      error,
      helperText,
      disabled = false,
      required = false,
      showRequiredIndicator,
      fullWidth = false,
      icon,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const selectId =
      name || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const shouldShowRequired = required && (showRequiredIndicator ?? hasError);

    const selectClass = [
      "select",
      hasError && "select--error",
      disabled && "select--disabled",
      icon && "select--with-icon",
      fullWidth && "select--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClass = [
      "select-wrapper",
      fullWidth && "select-wrapper--full-width",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClass}>
        {label && (
          <label htmlFor={selectId} className="select__label">
            {label}
            {shouldShowRequired && <span className="select__required">*</span>}
          </label>
        )}

        <div className="select__container">
          {icon && <span className="select__icon">{icon}</span>}

          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={selectClass}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${selectId}-error`
                : helperText
                  ? `${selectId}-helper`
                  : undefined
            }
            {...props}
          >
            {children ? (
              children
            ) : (
              <>
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}

                {options.map((option) => {
                  const optionValue =
                    typeof option === "object" ? option.value : option;
                  const optionLabel =
                    typeof option === "object" ? option.label : option;
                  const isDisabled =
                    typeof option === "object" && option.disabled;

                  return (
                    <option
                      key={optionValue}
                      value={optionValue}
                      disabled={isDisabled}
                    >
                      {optionLabel}
                    </option>
                  );
                })}
              </>
            )}
          </select>

          <span className="select__chevron">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="select__error">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${selectId}-helper`} className="select__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
