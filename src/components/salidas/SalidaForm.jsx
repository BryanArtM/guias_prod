import { useState } from "react";
import { Select } from "../common/Select";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Alert } from "../common/Alert";
import { obtenerStockPorVariante } from "../../services/api";

export default function SalidaForm({
  onSubmit,
  onCancel,
  variantes = [],
  tiposSalida = [],
}) {
  const [formData, setFormData] = useState({
    variante_id: "",
    tipo_salida_id: "",
    fecha: new Date().toISOString().split("T")[0],
    kg: "",
    cajas: "",
    numero_orden: "",
    observaciones: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [stockDisponible, setStockDisponible] = useState(null);

  // Determinar si es ORDEN_EMBARQUE
  const tipoOrdenEmbarque = tiposSalida.find(
    (t) => t.codigo === "ORDEN_EMBARQUE",
  );
  const mostrarNumeroOrden =
    tipoOrdenEmbarque &&
    formData.tipo_salida_id === tipoOrdenEmbarque.id.toString();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }

    // Cargar stock cuando selecciona variante
    if (name === "variante_id" && value) {
      try {
        const stock = await obtenerStockPorVariante();
        const varianteStock = stock.find(
          (s) => s.variante_id === parseInt(value),
        );
        setStockDisponible(varianteStock);
      } catch (error) {
        console.error("Error al cargar stock:", error);
        setStockDisponible(null);
      }
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.variante_id) {
      nuevosErrores.variante_id = "Debe seleccionar una variante";
    }

    if (!formData.tipo_salida_id) {
      nuevosErrores.tipo_salida_id = "Debe seleccionar un tipo de salida";
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = "La fecha es requerida";
    }

    if (!formData.kg || parseFloat(formData.kg) <= 0) {
      nuevosErrores.kg = "Los kilogramos deben ser mayor a 0";
    }

    // Validar stock
    if (stockDisponible && parseFloat(formData.kg) > stockDisponible.kg_stock) {
      nuevosErrores.kg = `Stock insuficiente. Disponible: ${stockDisponible.kg_stock.toFixed(2)} kg`;
    }

    // Validar número de orden si es requerido
    if (mostrarNumeroOrden && !formData.numero_orden?.trim()) {
      nuevosErrores.numero_orden = "El número de orden es requerido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);
    try {
      const dataToSend = {
        variante_id: parseInt(formData.variante_id),
        tipo_salida_id: parseInt(formData.tipo_salida_id),
        fecha: formData.fecha,
        kg: parseFloat(formData.kg),
        cajas: formData.cajas ? parseInt(formData.cajas) : null,
        numero_orden: formData.numero_orden?.trim() || null,
        observaciones: formData.observaciones?.trim() || null,
      };

      await onSubmit(dataToSend);
    } catch (error) {
      throw error;
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mostrar stock disponible si hay variante seleccionada */}
      {stockDisponible && (
        <Alert type="info">
          <div className="flex justify-between">
            <span className="font-semibold">Stock Disponible:</span>
            <span className="font-mono">
              {stockDisponible.kg_stock.toFixed(2)} kg |{" "}
              {stockDisponible.cajas_stock} cajas
            </span>
          </div>
        </Alert>
      )}

      {/* Variante */}
      <Select
        label="Variante"
        name="variante_id"
        value={formData.variante_id}
        onChange={handleChange}
        error={errores.variante_id}
        required
      >
        <option value="">Seleccione una variante</option>
        {variantes.map((variante) => (
          <option key={variante.variante_id} value={variante.variante_id}>
            {variante.codigo_completo}
          </option>
        ))}
      </Select>

      {/* Tipo de Salida */}
      <Select
        label="Tipo de Salida"
        name="tipo_salida_id"
        value={formData.tipo_salida_id}
        onChange={handleChange}
        error={errores.tipo_salida_id}
        required
      >
        <option value="">Seleccione un tipo</option>
        {tiposSalida.map((tipo) => (
          <option key={tipo.id} value={tipo.id}>
            {tipo.codigo} {tipo.descripcion && `- ${tipo.descripcion}`}
          </option>
        ))}
      </Select>

      {/* Fecha */}
      <Input
        label="Fecha"
        name="fecha"
        type="date"
        value={formData.fecha}
        onChange={handleChange}
        error={errores.fecha}
        required
      />

      {/* Kilogramos */}
      <Input
        label="Kilogramos"
        name="kg"
        type="number"
        step="0.01"
        min="0.01"
        value={formData.kg}
        onChange={handleChange}
        error={errores.kg}
        required
      />

      {/* Cajas */}
      <Input
        label="Cajas"
        name="cajas"
        type="number"
        min="0"
        value={formData.cajas}
        onChange={handleChange}
        placeholder="Opcional"
      />

      {/* Número de Orden (Condicional) */}
      {mostrarNumeroOrden && (
        <Input
          label="Número de Orden de Embarque"
          name="numero_orden"
          type="text"
          value={formData.numero_orden}
          onChange={handleChange}
          error={errores.numero_orden}
          required
        />
      )}

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Notas adicionales (opcional)"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : "Registrar Salida"}
        </Button>
      </div>
    </form>
  );
}
