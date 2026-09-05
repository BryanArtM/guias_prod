import { useState, useEffect } from "react";
import { Input, Button, Alert } from "@/components/common";

export function EspecieForm({ onSubmit, onCancel, especie = null }) {
  const [formData, setFormData] = useState({
    nombre: "",
    peso_unidad_defecto: "",
    abreviatura_trazabilidad: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRequired, setShowRequired] = useState(false);

  useEffect(() => {
    if (especie) {
      setFormData({
        nombre: especie.nombre || "",
        peso_unidad_defecto: especie.peso_unidad_defecto ?? "",
        abreviatura_trazabilidad: especie.abreviatura_trazabilidad || "",
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

    const abreviatura = formData.abreviatura_trazabilidad.trim().toUpperCase();
    if (abreviatura && !/^[A-ZÑ]{2}$/.test(abreviatura)) {
      setError("La abreviatura de trazabilidad debe tener exactamente 2 letras");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        peso_unidad_defecto: formData.peso_unidad_defecto
          ? parseFloat(formData.peso_unidad_defecto)
          : null,
        abreviatura_trazabilidad: abreviatura || null,
      });
      setFormData({
        nombre: "",
        peso_unidad_defecto: "",
        abreviatura_trazabilidad: "",
      });
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

      <Input
        label="Abreviatura de trazabilidad"
        name="abreviatura_trazabilidad"
        value={formData.abreviatura_trazabilidad}
        onChange={(e) =>
          setFormData({
            ...formData,
            abreviatura_trazabilidad: e.target.value.toUpperCase(),
          })
        }
        maxLength={2}
        className="uppercase"
        helperText="Dos letras que se asignan al código de trazabilidad"
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
