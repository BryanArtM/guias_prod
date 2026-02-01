import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  crearGuia,
  actualizarGuia,
  obtenerProductos,
  crearGuiaDetalle,
} from "../../services/api";
import { Plus, Trash2 } from "lucide-react";
import { Modal, Input, Select, Button, Table } from "../common";

export const GuiaForm = ({ guia, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    numero_guia: "",
    fecha: new Date().toISOString().split("T")[0],
    responsable: "",
    observaciones: "",
  });

  const [productos, setProductos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [lote, setLote] = useState("");

  useEffect(() => {
    cargarProductos();
    if (guia) {
      setFormData(guia);
    }
  }, [guia]);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guia && detalles.length === 0) {
      alert("Debe agregar al menos un producto a la guía");
      return;
    }

    try {
      let guiaId;

      if (guia?.id) {
        await actualizarGuia(guia.id, formData);
        guiaId = guia.id;
      } else {
        guiaId = await crearGuia(formData);

        // Crear los detalles
        for (const detalle of detalles) {
          const guiaDetalle = {
            guia_id: guiaId,
            producto_id: detalle.producto_id,
            cantidad: detalle.cantidad,
            lote: detalle.lote,
          };
          await crearGuiaDetalle(guiaDetalle);
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error al guardar guía:", error);
      alert("Error al guardar guía: " + error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0 || !lote) {
      alert("Complete todos los campos del producto");
      return;
    }

    const producto = productos.find(
      (p) => p.id === Number(productoSeleccionado),
    );
    if (!producto) return;

    const nuevoDetalle = {
      producto_id: Number(productoSeleccionado),
      cantidad,
      lote,
      producto_nombre: producto.nombre,
    };

    setDetalles((prev) => [...prev, nuevoDetalle]);
    setProductoSeleccionado("");
    setCantidad(1);
    setLote("");
  };

  const eliminarDetalle = (index) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };

  const productosOptions = productos.map((p) => ({
    value: p.id,
    label: `${p.codigo} - ${p.nombre}`,
  }));

  const columnasDetalles = [
    { key: "producto", header: "Producto", align: "left" },
    { key: "cantidad", header: "Cantidad", align: "right" },
    { key: "lote", header: "Lote", align: "left" },
    { key: "acciones", header: "Acción", align: "center" },
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={guia ? "Editar Guía" : "Nueva Guía"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Número de Guía"
            name="numero_guia"
            value={formData.numero_guia}
            onChange={handleChange}
            required
            fullWidth
          />

          <Input
            label="Fecha"
            name="fecha"
            type="date"
            value={formData.fecha}
            onChange={handleChange}
            required
            fullWidth
          />
        </div>

        <Input
          label="Responsable"
          name="responsable"
          value={formData.responsable}
          onChange={handleChange}
          required
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {!guia && (
          <>
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Productos
              </h3>

              <div className="grid grid-cols-12 gap-2 mb-4">
                <div className="col-span-5">
                  <Select
                    label="Producto"
                    value={productoSeleccionado}
                    onChange={(e) =>
                      setProductoSeleccionado(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    options={productosOptions}
                    placeholder="Seleccione un producto"
                    fullWidth
                  />
                </div>

                <div className="col-span-2">
                  <Input
                    label="Cantidad"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    fullWidth
                  />
                </div>

                <div className="col-span-3">
                  <Input
                    label="Lote"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    fullWidth
                  />
                </div>

                <div className="col-span-2 flex items-end">
                  <Button
                    type="button"
                    onClick={agregarProducto}
                    variant="success"
                    icon={<Plus size={18} />}
                    fullWidth
                  >
                    Agregar
                  </Button>
                </div>
              </div>

              {detalles.length > 0 && (
                <Table
                  columns={columnasDetalles}
                  data={detalles}
                  bordered
                  renderRow={(detalle, index) => (
                    <>
                      <td className="py-2 px-3 text-sm">
                        {detalle.producto_nombre}
                      </td>
                      <td className="py-2 px-3 text-sm text-right">
                        {detalle.cantidad}
                      </td>
                      <td className="py-2 px-3 text-sm">{detalle.lote}</td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          type="button"
                          onClick={() => eliminarDetalle(index)}
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-800"
                        />
                      </td>
                    </>
                  )}
                />
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {guia ? "Actualizar" : "Crear Guía"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
GuiaForm.propTypes = {
  guia: PropTypes.shape({
    id: PropTypes.number,
    numero_guia: PropTypes.string,
    fecha: PropTypes.string,
    responsable: PropTypes.string,
    observaciones: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
