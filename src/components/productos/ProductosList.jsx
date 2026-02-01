import { useState, useEffect } from "react";
import { obtenerProductos, eliminarProducto } from "../../services/api";
import { ProductoForm } from "./ProductoForm";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button, Card, Table, Loading } from "../common";

export const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(undefined);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      alert("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleNuevo = () => {
    setSelectedProducto(undefined);
    setShowForm(true);
  };

  const handleEditar = (producto) => {
    setSelectedProducto(producto);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este producto?")) {
      try {
        await eliminarProducto(id);
        cargarProductos();
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert(
          "Error al eliminar producto. Puede que esté en uso en alguna guía.",
        );
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProducto(undefined);
  };

  const handleSave = () => {
    cargarProductos();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando productos..." />
      </div>
    );
  }

  // Configuración de columnas para el componente Table
  const columns = [
    { key: "codigo", header: "Código", align: "left" },
    { key: "nombre", header: "Nombre", align: "left" },
    { key: "unidad", header: "Unidad", align: "left" },
    { key: "descripcion", header: "Descripción", align: "left" },
    { key: "acciones", header: "Acciones", align: "right" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
        <Button
          variant="primary"
          icon={<Plus size={20} />}
          onClick={handleNuevo}
        >
          Nuevo Producto
        </Button>
      </div>

      {productos.length === 0 ? (
        <Card padding="xl">
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              No hay productos registrados
            </p>
            <p className="text-gray-400 mt-2">
              Comienza agregando tu primer producto
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <Table
            columns={columns}
            data={productos}
            hover
            renderRow={(producto) => (
              <>
                <td className="py-3 px-4 font-mono text-sm">
                  {producto.codigo}
                </td>
                <td className="py-3 px-4 font-medium">{producto.nombre}</td>
                <td className="py-3 px-4">{producto.unidad}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {producto.descripcion}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={18} />}
                      onClick={() => handleEditar(producto)}
                      className="text-blue-600 hover:text-blue-800"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={18} />}
                      onClick={() => handleEliminar(producto.id)}
                      className="text-red-600 hover:text-red-800"
                    />
                  </div>
                </td>
              </>
            )}
          />
        </Card>
      )}

      {showForm && (
        <ProductoForm
          producto={selectedProducto}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
