import { useState } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Modal, Alert, Input } from "@/components/common";
import { Edit2, Trash2, Plus } from "lucide-react";

export default function CatalogoManager({
  titulo,
  datos,
  campos,
  onCrear,
  onActualizar,
  onEliminar,
  onRecargar,
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [formData, setFormData] = useState({});
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [alerta, setAlerta] = useState(null);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const abrirModal = (item = null) => {
    setItemEditando(item);
    if (item) {
      setFormData({ ...item });
    } else {
      const initialData = {};
      campos.forEach((campo) => {
        initialData[campo.name] = campo.type === "number" ? "" : "";
      });
      setFormData(initialData);
    }
    setErrores({});
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setItemEditando(null);
    setFormData({});
    setErrores({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    campos.forEach((campo) => {
      if (campo.required && !formData[campo.name]?.toString().trim()) {
        nuevosErrores[campo.name] = `${campo.label} es requerido`;
      }
    });

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
      const dataToSend = { ...formData };

      // Convertir números
      campos.forEach((campo) => {
        if (campo.type === "number" && dataToSend[campo.name]) {
          dataToSend[campo.name] = parseFloat(dataToSend[campo.name]);
        }
      });

      if (itemEditando) {
        await onActualizar(itemEditando.id, dataToSend);
        mostrarAlerta(`${titulo} actualizado exitosamente`);
      } else {
        await onCrear(dataToSend);
        mostrarAlerta(`${titulo} creado exitosamente`);
      }

      cerrarModal();
      if (onRecargar) onRecargar();
    } catch (error) {
      mostrarAlerta(
        error.message || `Error al guardar ${titulo.toLowerCase()}`,
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      return;
    }

    try {
      await onEliminar(id);
      mostrarAlerta(`${titulo} eliminado exitosamente`);
      if (onRecargar) onRecargar();
    } catch (error) {
      mostrarAlerta(
        error.message || `Error al eliminar ${titulo.toLowerCase()}`,
        "error",
      );
    }
  };

  const obtenerColumnas = () => {
    return ["ID", ...campos.map((c) => c.label), "Acciones"];
  };

  const renderCelda = (item, campo) => {
    const valor = item[campo.name];
    if (campo.type === "number") {
      return valor || valor === 0 ? valor : "-";
    }
    return valor || "-";
  };

  return (
    <div>
      {alerta && (
        <Alert type={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
        <Button
          onClick={() => abrirModal()}
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
        >
          Crear {titulo}
        </Button>
      </div>

      {datos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay {titulo.toLowerCase()} registrados
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {obtenerColumnas().map((col, idx) => (
                  <TableHead key={idx}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {datos.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{item.id}</TableCell>
                  {campos.map((campo, idx) => (
                    <TableCell key={idx} className="text-center">
                      {renderCelda(item, campo)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex gap-5 justify-center ">
                      <button
                        onClick={() => abrirModal(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleEliminar(item.id, item[campos[0].name])
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={`${itemEditando ? "Editar" : "Crear"} ${titulo}`}
      >
        <form onSubmit={handleSubmit}>
          {campos.map((campo) => (
            <Input
              key={campo.name}
              label={campo.label}
              name={campo.name}
              type={campo.type || "text"}
              value={formData[campo.name] || ""}
              onChange={handleInputChange}
              error={errores[campo.name]}
              required={campo.required}
              min={campo.min}
              step={campo.step}
              placeholder={campo.placeholder}
            />
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit" disabled={cargando}>
              {cargando ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
