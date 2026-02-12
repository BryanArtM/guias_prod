import { useState, useEffect } from "react";
import { Input, Select, Button, Alert } from "@/components/common";

export function PresentacionForm({
  onSubmit,
  onCancel,
  presentacion = null,
  especies = [],
}) {
  const [formData, setFormData] = useState({
    especie_id: "",
    nombre: "",
    descripcion: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presentacion) {
      setFormData({
        especie_id: presentacion.especie_id || "",
        nombre: presentacion.nombre || "",
        descripcion: presentacion.descripcion || "",
      });
    }
  }, [presentacion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.especie_id) {
      setError("Debes seleccionar una especie");
      return;
    }

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        especie_id: parseInt(formData.especie_id),
      });
      setFormData({ especie_id: "", nombre: "", descripcion: "" });
    } catch (err) {
      setError(err.message || "Error al guardar la presentación");
    } finally {
      setLoading(false);
    }
  };

  const especiesOptions = especies.map((especie) => ({
    value: especie.id.toString(),
    label: especie.nombre,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Select
        label="Especie *"
        name="especie_id"
        value={formData.especie_id}
        onChange={(e) =>
          setFormData({ ...formData, especie_id: e.target.value })
        }
        options={[
          { value: "", label: "Selecciona una especie..." },
          ...especiesOptions,
        ]}
        required
      />

      <Input
        label="Nombre *"
        name="nombre"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        placeholder="Ej: Tubo, Tentáculos, Filete"
        required
        autoFocus={!presentacion}
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
          placeholder="Descripción opcional de la presentación"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

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
          {loading ? "Guardando..." : presentacion ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
