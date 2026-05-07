import { forwardRef } from "react";
import "./Input.css";

/**
 * Ejemplo de uso:
 *
 * <Input
 *   label="Correo electrónico"
 *   name="email"
 *   type="email"
 *   value={email}
 *   onChange={e => setEmail(e.target.value)}
 *   placeholder="usuario@dominio.com"
 *   error={errorEmail}
 *   helperText="Nunca compartiremos tu correo."
 *   required
 *   fullWidth
 *   icon={<MailIcon />}
 * />
 */

/**
 * @typedef {Object} InputProps
 * @property {string} [label] - Etiqueta del input
 * @property {'text'|'email'|'password'|'number'|'tel'|'url'|'search'|'date'|'time'|'datetime-local'} [type='text'] - Tipo de input
 * @property {string} [name] - Nombre del input
 * @property {string|number} [value] - Valor del input
 * @property {function} [onChange] - Función callback para cambios
 * @property {function} [onBlur] - Función callback para blur
 * @property {string} [placeholder] - Texto placeholder
 * @property {string} [error] - Mensaje de error
 * @property {string} [helperText] - Texto de ayuda
 * @property {boolean} [disabled=false] - Deshabilitar el input
 * @property {boolean} [required=false] - Campo requerido
 * @property {boolean} [showRequiredIndicator] - Mostrar asterisco solo cuando corresponda
 * @property {boolean} [fullWidth=false] - Ocupar todo el ancho
 * @property {React.ReactNode} [icon] - Icono a mostrar
 * @property {'left'|'right'} [iconPosition='left'] - Posición del icono
 * @property {string} [className=''] - Clases CSS adicionales
 */

export const Input = forwardRef(
  (
    {
      label,
      type = "text",
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      error,
      helperText,
      disabled = false,
      required = false,
      showRequiredIndicator,
      fullWidth = false,
      icon,
      iconPosition = "left",
      className = "",
      ...props
    },
    ref,
  ) => {
    const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    const shouldShowRequired = required && (showRequiredIndicator ?? hasError);

    const inputClass = [
      "input",
      hasError && "input--error",
      disabled && "input--disabled",
      icon && `input--with-icon-${iconPosition}`,
      fullWidth && "input--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClass = [
      "input-wrapper",
      fullWidth && "input-wrapper--full-width",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClass}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
            {shouldShowRequired && <span className="input__required">*</span>}
          </label>
        )}

        <div className="input__container">
          {icon && iconPosition === "left" && (
            <span className="input__icon input__icon--left">{icon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClass}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {icon && iconPosition === "right" && (
            <span className="input__icon input__icon--right">{icon}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="input__error">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="input__helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
