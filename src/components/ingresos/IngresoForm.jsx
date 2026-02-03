import { useState, useEffect } from "react";
import { Select } from "../common/Select";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

export default function IngresoForm({
  onSubmit,
  onCancel,
  variantes = [],
  tiposIngreso = [],
}) {
  const [formData, setFormData] = useState({
    variante_id: "",
    tipo_ingreso_id: "",
    fecha: new Date().toISOString().split("T")[0],
    peso_total_lote: "",
    kg: "",
    cajas: "",
    observaciones: "",
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  // Determinar si es ORDEN_DESEMBARQUE
  const tipoOrdenDesembarque = tiposIngreso.find(
    (t) => t.codigo === "ORDEN_DESEMBARQUE",
  );
  const mostrarNumeroOrden =
    tipoOrdenDesembarque &&
    formData.tipo_ingreso_id === tipoOrdenDesembarque.id.toString();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.variante_id) {
      nuevosErrores.variante_id = "Debe seleccionar una variante";
    }

    if (!formData.tipo_ingreso_id) {
      nuevosErrores.tipo_ingreso_id = "Debe seleccionar un tipo de ingreso";
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = "La fecha es requerida";
    }

    if (!formData.kg || parseFloat(formData.kg) <= 0) {
      nuevosErrores.kg = "Los kilogramos deben ser mayor a 0";
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
        tipo_ingreso_id: parseInt(formData.tipo_ingreso_id),
        fecha: formData.fecha,
        peso_total_lote: formData.peso_total_lote
          ? parseFloat(formData.peso_total_lote)
          : null,
        kg: parseFloat(formData.kg),
        cajas: formData.cajas ? parseInt(formData.cajas) : null,
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

      {/* Tipo de Ingreso */}
      <Select
        label="Tipo de Ingreso"
        name="tipo_ingreso_id"
        value={formData.tipo_ingreso_id}
        onChange={handleChange}
        error={errores.tipo_ingreso_id}
        required
      >
        <option value="">Seleccione un tipo</option>
        {tiposIngreso.map((tipo) => (
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

      {/* Peso Total del Lote */}
      <Input
        label="Peso Total del Lote (kg)"
        name="peso_total_lote"
        type="number"
        step="0.01"
        min="0"
        value={formData.peso_total_lote}
        onChange={handleChange}
        placeholder="Opcional"
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
          {cargando ? "Guardando..." : "Registrar Ingreso"}
        </Button>
      </div>
    </form>
  );
}
