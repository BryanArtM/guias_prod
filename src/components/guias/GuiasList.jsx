import { useState, useEffect } from "react";
import { obtenerGuias, eliminarGuia } from "../../services/api";
import { GuiaDetalle } from "./GuiaDetalle";
import { GuiaForm } from "./GuiaForm";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { Button, Card, Table, Loading } from "../common";

export const GuiasList = () => {
  const [guias, setGuias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGuia, setSelectedGuia] = useState(undefined);
  const [detalleGuiaId, setDetalleGuiaId] = useState(null);

  const cargarGuias = async () => {
    try {
      setLoading(true);
      const data = await obtenerGuias();
      setGuias(data);
    } catch (error) {
      console.error("Error al cargar guías:", error);
      alert("Error al cargar guías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGuias();
  }, []);

  const handleNueva = () => {
    setSelectedGuia(undefined);
    setShowForm(true);
  };

  const handleEditar = (guia) => {
    setSelectedGuia(guia);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (
      window.confirm(
        "¿Está seguro de eliminar esta guía y todos sus productos?",
      )
    ) {
      try {
        await eliminarGuia(id);
        cargarGuias();
      } catch (error) {
        console.error("Error al eliminar guía:", error);
        alert("Error al eliminar guía");
      }
    }
  };

  const handleVerDetalle = (id) => {
    setDetalleGuiaId(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedGuia(undefined);
  };

  const handleSave = () => {
    cargarGuias();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando guías..." />
      </div>
    );
  }

  if (detalleGuiaId) {
    return (
      <GuiaDetalle
        guiaId={detalleGuiaId}
        onClose={() => setDetalleGuiaId(null)}
      />
    );
  }

  const columnasGuias = [
    { key: "numero", header: "Número", align: "left" },
    { key: "fecha", header: "Fecha", align: "left" },
    { key: "responsable", header: "Responsable", align: "left" },
    { key: "observaciones", header: "Observaciones", align: "left" },
    { key: "acciones", header: "Acciones", align: "right" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Guías de Producción
        </h1>
        <Button
          onClick={handleNueva}
          variant="primary"
          icon={<Plus size={20} />}
        >
          Nueva Guía
        </Button>
      </div>

      {guias.length === 0 ? (
        <Card padding="xl">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No hay guías registradas</p>
            <p className="text-gray-400 mt-2">
              Comienza creando tu primera guía de producción
            </p>
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <Table
            columns={columnasGuias}
            data={guias}
            hover
            renderRow={(guia) => (
              <>
                <td className="py-3 px-4 font-mono text-sm font-medium">
                  {guia.numero_guia}
                </td>
                <td className="py-3 px-4">{guia.fecha}</td>
                <td className="py-3 px-4">{guia.responsable}</td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {guia.observaciones}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleVerDetalle(guia.id)}
                      variant="ghost"
                      size="sm"
                      icon={<FileText size={18} />}
                      className="text-green-600 hover:text-green-800"
                    />
                    <Button
                      onClick={() => handleEditar(guia)}
                      variant="ghost"
                      size="sm"
                      icon={<Edit size={18} />}
                      className="text-blue-600 hover:text-blue-800"
                    />
                    <Button
                      onClick={() => handleEliminar(guia.id)}
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={18} />}
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
        <GuiaForm
          guia={selectedGuia}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
