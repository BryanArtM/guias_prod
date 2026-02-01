import { useState, useEffect } from "react";
import { crearProducto, actualizarProducto } from "../../services/api";
import PropTypes from "prop-types";
import { Modal, Input, Select, Button } from "../common";

export const ProductoForm = ({ producto, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    unidad: "kg",
    descripcion: "",
  });

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    }
  }, [producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (producto?.id) {
        await actualizarProducto(producto.id, formData);
      } else {
        await crearProducto(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar producto: " + error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const unidadesOptions = [
    { value: "kg", label: "Kilogramos (kg)" },
    { value: "g", label: "Gramos (g)" },
    { value: "l", label: "Litros (l)" },
    { value: "ml", label: "Mililitros (ml)" },
    { value: "unidad", label: "Unidad" },
    { value: "caja", label: "Caja" },
    { value: "paquete", label: "Paquete" },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={producto ? "Editar Producto" : "Nuevo Producto"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Código"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          required
          fullWidth
        />

        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          fullWidth
        />

        <Select
          label="Unidad"
          name="unidad"
          value={formData.unidad}
          onChange={handleChange}
          options={unidadesOptions}
          required
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {producto ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
ProductoForm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  productoEdit: PropTypes.shape({
    id: PropTypes.number,
    nombre: PropTypes.string,
    descripcion: PropTypes.string,
    unidad_medida: PropTypes.string,
    precio_unitario: PropTypes.number,
  }),
};
