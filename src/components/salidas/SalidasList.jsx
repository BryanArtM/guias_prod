import { useState, useEffect } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../common/Table";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Alert } from "../common/Alert";
import { Select } from "../common/Select";
import SalidaForm from "./SalidaForm";
import { Trash2, Plus, Filter } from "lucide-react";
import {
  obtenerSalidas,
  crearSalida,
  eliminarSalida,
} from "../../services/api";

export default function SalidasList({ variantes = [], tiposSalida = [] }) {
  const [salidas, setSalidas] = useState([]);
  const [salidasFiltradas, setSalidasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alerta, setAlerta] = useState(null);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroVariante, setFiltroVariante] = useState("");

  useEffect(() => {
    cargarSalidas();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...salidas];

    if (filtroTipo) {
      resultado = resultado.filter(
        (s) => s.tipo_salida_id === parseInt(filtroTipo),
      );
    }

    if (filtroVariante) {
      resultado = resultado.filter(
        (s) => s.variante_id === parseInt(filtroVariante),
      );
    }

    setSalidasFiltradas(resultado);
  }, [salidas, filtroTipo, filtroVariante]);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const cargarSalidas = async () => {
    setCargando(true);
    try {
      const data = await obtenerSalidas();
      setSalidas(data);
    } catch (error) {
      mostrarAlerta("Error al cargar salidas: " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = () => {
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const handleCrear = async (data) => {
    try {
      await crearSalida(data);
      mostrarAlerta("Salida registrada exitosamente");
      cerrarModal();
      cargarSalidas();
    } catch (error) {
      throw error;
    }
  };

  const handleEliminar = async (id, fecha) => {
    if (!window.confirm(`¿Estás seguro de eliminar la salida del ${fecha}?`)) {
      return;
    }

    try {
      await eliminarSalida(id);
      mostrarAlerta("Salida eliminada exitosamente");
      cargarSalidas();
    } catch (error) {
      mostrarAlerta("Error al eliminar salida: " + error.message, "error");
    }
  };

  const obtenerCodigoVariante = (varianteId) => {
    const variante = variantes.find((v) => v.variante_id === varianteId);
    return variante ? variante.codigo_completo : `ID: ${varianteId}`;
  };

  const obtenerNombreTipo = (tipoId) => {
    const tipo = tiposSalida.find((t) => t.id === tipoId);
    return tipo ? tipo.codigo : "-";
  };

  const limpiarFiltros = () => {
    setFiltroTipo("");
    setFiltroVariante("");
  };

  const hayFiltrosActivos = filtroTipo || filtroVariante;

  if (cargando) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {alerta && (
        <Alert type={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Registro de Salidas
        </h2>
        <Button onClick={abrirModal} icon={<Plus className="w-4 h-4" />} iconPosition="left">
          Registrar Salida
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Filtrar por Tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {tiposSalida.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.codigo}
                </option>
              ))}
            </Select>

            <Select
              label="Filtrar por Variante"
              value={filtroVariante}
              onChange={(e) => setFiltroVariante(e.target.value)}
            >
              <option value="">Todas las variantes</option>
              {variantes.map((variante) => (
                <option key={variante.variante_id} value={variante.variante_id}>
                  {variante.codigo_completo}
                </option>
              ))}
            </Select>
          </div>

          {hayFiltrosActivos && (
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Mostrando {salidasFiltradas.length} de {salidas.length} salidas
        </p>
      </div>

      {salidasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {salidas.length === 0
            ? "No hay salidas registradas"
            : "No se encontraron salidas con los filtros aplicados"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Código Variante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Kg</TableHead>
              <TableHead>Cajas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salidasFiltradas.map((salida) => (
              <TableRow key={salida.id}>
                <TableCell>{salida.fecha}</TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-blue-700">
                    {obtenerCodigoVariante(salida.variante_id)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    {obtenerNombreTipo(salida.tipo_salida_id)}
                  </span>
                </TableCell>
                <TableCell>{salida.kg.toFixed(2)}</TableCell>
                <TableCell>{salida.cajas || "-"}</TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => handleEliminar(salida.id, salida.fecha)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title="Registrar Salida"
        size="large"
      >
        <SalidaForm
          onSubmit={handleCrear}
          onCancel={cerrarModal}
          variantes={variantes}
          tiposSalida={tiposSalida}
        />
      </Modal>
    </div>
  );
}
