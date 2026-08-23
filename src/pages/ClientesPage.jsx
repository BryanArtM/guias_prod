import { useEffect, useState } from "react";
import { CatalogoManager } from "@/components/catalogos";
import { Loading, Alert } from "@/components/common";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from "@/services";

const CAMPOS_CLIENTE = [
  {
    name: "codigo",
    label: "Código",
    type: "text",
    required: true,
  },
  {
    name: "razon_social",
    label: "Razón Social",
    type: "text",
    required: true,
    placeholder: "Ej: Pesquera del Norte S.A.C.",
  },
];

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setCargando(true);
      setClientes(await obtenerClientes());
      setError(null);
    } catch (err) {
      setError("Error al cargar los clientes: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <Loading />;
  }

  return (
    <div className="px-5 py-4">
      {error && <Alert variant="error">{error}</Alert>}

      <CatalogoManager
        titulo="Cliente"
        datos={clientes}
        campos={CAMPOS_CLIENTE}
        onCrear={crearCliente}
        onActualizar={actualizarCliente}
        onEliminar={eliminarCliente}
        onRecargar={cargarClientes}
      />
    </div>
  );
}
