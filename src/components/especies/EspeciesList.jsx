import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  crearEspecie,
  obtenerEspecies,
  actualizarEspecie,
  eliminarEspecie,
} from "@/services";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Modal, Alert, Loading, PageActions } from "@/components/common";
import { EspecieForm } from "./EspecieForm";

export function EspeciesList() {
  const [especies, setEspecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEspecie, setEditingEspecie] = useState(null);

  useEffect(() => {
    cargarEspecies();
  }, []);

  const cargarEspecies = async () => {
    try {
      setLoading(true);
      const data = await obtenerEspecies();
      setEspecies(data);
      setError("");
    } catch (err) {
      setError("Error al cargar las especies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = () => {
    setEditingEspecie(null);
    setShowModal(true);
  };

  const handleEditar = (especie) => {
    setEditingEspecie(especie);
    setShowModal(true);
  };

  const handleEliminar = async (especie) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la especie "${especie.nombre}"?\n\nNOTA: No se puede eliminar si tiene presentaciones asociadas.`,
      )
    ) {
      return;
    }

    try {
      await eliminarEspecie(especie.id);
      setSuccess(`Especie "${especie.nombre}" eliminada correctamente`);
      cargarEspecies();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error al eliminar: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingEspecie) {
        await actualizarEspecie(editingEspecie.id, formData);
        setSuccess("Especie actualizada correctamente");
      } else {
        await crearEspecie(formData);
        setSuccess("Especie creada correctamente");
      }
      setShowModal(false);
      cargarEspecies();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      throw new Error(err.message || "Error al guardar");
    }
  };

  if (loading) {
    return <Loading text="Cargando especies..." />;
  }

  return (
    <div className="space-y-4">
      <PageActions>
        <Button
          size="sm"
          onClick={handleCrear}
          icon={<Plus />}
          iconPosition="left"
        >
          Nueva Especie
        </Button>
      </PageActions>

      {/* Alertas */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Tabla */}
      <div className="border border-line bg-surface overflow-hidden rounded-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Abrev. Trazabilidad</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Peso Und. Defecto (kg)</TableHead>
              <TableHead className="text-right pe-14">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {especies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No hay especies registradas. Crea la primera especie.
                </TableCell>
              </TableRow>
            ) : (
              especies.map((especie) => (
                <TableRow key={especie.id}>
                  <TableCell className="font-mono text-sm">
                    {especie.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {especie.nombre}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {especie.abreviatura_trazabilidad || (
                      <span className="text-gray-400 italic">Sin definir</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {especie.descripcion || (
                      <span className="text-gray-400 italic">
                        Sin descripción
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {especie.peso_unidad_defecto ?? (
                      <span className="text-gray-400 italic">Sin definir</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditar(especie)}
                        title="Editar especie"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminar(especie)}
                        title="Eliminar especie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEspecie ? "Editar Especie" : "Nueva Especie"}
      >
        <EspecieForm
          especie={editingEspecie}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
