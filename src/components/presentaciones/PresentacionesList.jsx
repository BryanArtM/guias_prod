import { useState, useEffect } from "react";
import { Edit2, Trash2, Plus, Filter } from "lucide-react";
import {
  crearPresentacion,
  obtenerPresentaciones,
  actualizarPresentacion,
  eliminarPresentacion,
} from "@/services";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Select, Modal, Alert, Loading } from "@/components/common";
import { PresentacionForm } from "./PresentacionForm";

export function PresentacionesList({ especies = [] }) {
  const [presentaciones, setPresentaciones] = useState([]);
  const [presentacionesFiltradas, setPresentacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPresentacion, setEditingPresentacion] = useState(null);
  const [filtroEspecie, setFiltroEspecie] = useState("");

  useEffect(() => {
    cargarPresentaciones();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [presentaciones, filtroEspecie]);

  const cargarPresentaciones = async () => {
    try {
      setLoading(true);
      const data = await obtenerPresentaciones();
      setPresentaciones(data);
      setError("");
    } catch (err) {
      setError("Error al cargar las presentaciones: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = presentaciones;

    if (filtroEspecie) {
      resultado = resultado.filter(
        (p) => p.especie_id === parseInt(filtroEspecie),
      );
    }

    setPresentacionesFiltradas(resultado);
  };

  const handleCrear = () => {
    setEditingPresentacion(null);
    setShowModal(true);
  };

  const handleEditar = (presentacion) => {
    setEditingPresentacion(presentacion);
    setShowModal(true);
  };

  const handleEliminar = async (presentacion) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la presentación "${presentacion.nombre}"?\n\nNOTA: No se puede eliminar si tiene variantes asociadas.`,
      )
    ) {
      return;
    }

    try {
      await eliminarPresentacion(presentacion.id);
      setSuccess(
        `Presentación "${presentacion.nombre}" eliminada correctamente`,
      );
      cargarPresentaciones();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error al eliminar: " + err.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingPresentacion) {
        await actualizarPresentacion(editingPresentacion.id, formData);
        setSuccess("Presentación actualizada correctamente");
      } else {
        await crearPresentacion(formData);
        setSuccess("Presentación creada correctamente");
      }
      setShowModal(false);
      cargarPresentaciones();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      throw new Error(err.message || "Error al guardar");
    }
  };

  const obtenerNombreEspecie = (especieId) => {
    const especie = especies.find((e) => e.id === especieId);
    return especie ? especie.nombre : "Desconocida";
  };

  if (loading) {
    return <Loading message="Cargando presentaciones..." />;
  }

  const especiesOptions = especies.map((especie) => ({
    value: especie.id.toString(),
    label: especie.nombre,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Presentaciones</h2>
          <p className="text-gray-600 text-sm">
            Gestión de presentaciones por especie
          </p>
        </div>
        <Button
          onClick={handleCrear}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          <span> Nueva Presentación </span>
        </Button>
      </div>

      {/* Alertas */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <Select
              label="Filtrar por Especie"
              name="filtroEspecie"
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
              options={[
                { value: "", label: "Todas las especies" },
                ...especiesOptions,
              ]}
            />
          </div>
          {filtroEspecie && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFiltroEspecie("")}
            >
              Limpiar filtro
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right pe-14">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presentacionesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {filtroEspecie
                    ? "No hay presentaciones para la especie seleccionada."
                    : "No hay presentaciones registradas. Crea la primera presentación."}
                </TableCell>
              </TableRow>
            ) : (
              presentacionesFiltradas.map((presentacion) => (
                <TableRow key={presentacion.id}>
                  <TableCell className="font-mono text-sm">
                    {presentacion.id}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {obtenerNombreEspecie(presentacion.especie_id)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {presentacion.nombre}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {presentacion.descripcion || (
                      <span className="text-gray-400 italic">
                        Sin descripción
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditar(presentacion)}
                        title="Editar presentación"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminar(presentacion)}
                        title="Eliminar presentación"
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

      {/* Stats */}
      <div className="text-sm text-gray-600">
        Mostrando {presentacionesFiltradas.length} de {presentaciones.length}{" "}
        presentaciones
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingPresentacion ? "Editar Presentación" : "Nueva Presentación"
        }
      >
        <PresentacionForm
          presentacion={editingPresentacion}
          especies={especies}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
