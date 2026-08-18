import { useState, useEffect } from "react";
import { Input, Button, Alert } from "@/components/common";

export function EspecieForm({ onSubmit, onCancel, especie = null }) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    peso_unidad_defecto: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequired, setShowRequired] = useState(false);

  useEffect(() => {
    if (especie) {
      setFormData({
        nombre: especie.nombre || "",
        descripcion: especie.descripcion || "",
        peso_unidad_defecto: especie.peso_unidad_defecto ?? "",
      });
    }
  }, [especie]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowRequired(true);

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        peso_unidad_defecto: formData.peso_unidad_defecto
          ? parseFloat(formData.peso_unidad_defecto)
          : null,
      });
      setFormData({ nombre: "", descripcion: "", peso_unidad_defecto: "" });
    } catch (err) {
      setError(err.message || "Error al guardar la especie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Nombre"
        name="nombre"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        placeholder="Ej: Pota, Calamar, Jurel"
        required
        showRequiredIndicator={showRequired && !formData.nombre.trim()}
        autoFocus
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          placeholder="Descripción opcional de la especie"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <Input
        label="Peso por unidad por defecto (kg)"
        name="peso_unidad_defecto"
        type="number"
        step="0.01"
        min="0"
        value={formData.peso_unidad_defecto}
        onChange={(e) =>
          setFormData({ ...formData, peso_unidad_defecto: e.target.value })
        }
        placeholder="Ej: 22.7"
        helperText="Se usa para precargar el peso por unidad al registrar un ingreso de esta especie"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : especie ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
