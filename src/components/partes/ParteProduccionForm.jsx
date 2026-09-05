import { useEffect, useState } from "react";
import { Alert, Input, Button, Loading, Modal } from "@/components/common";
import ReceptionSection from "./ReceptionSection";
import PackedProductSection from "./PackedProductSection";
import InsumosSection from "./InsumosSection";
import HeaderSection from "./HeaderSection";

import {
  obtenerEspecies,
  obtenerVariantesCompletas,
  crearVariantePresentacion,
  obtenerMotivosIngreso,
  obtenerTiposDocumentoProduccion,
  obtenerClientes,
} from "@/services";
import { useAuthStore } from "@/stores";
import { useFormDraft } from "@/hooks";

export default function ParteProduccionForm({
  tipo,
  onSubmit,
  onCancel,
  borradorKey = null,
  initialData = null,
}) {
  const { user } = useAuthStore();

  const [formData, setFormData, reiniciarFormulario] = useFormDraft(
    borradorKey,
    initialData || {
      codigo: "",
      revision: "",
      version: "",
      usuario: user?.username || "",
      cliente: "",
      cliente_id: "",
      fecha: new Date().toISOString().split("T")[0],
      turno: "DIA",
      codigo_trazabilidad: "",
      especie_id: "",
      motivo_ingreso_id: "",
      entera: 0,
      observaciones: "",
      tipo_documento_id: tipo || "",
      transportes: [
        {
          num_guia: "",
          num_carro: "",
          placa: "",
          embarcaciones: [
            {
              nombre_embarcacion_pesquera: "",
              matricula_embarcacion_pesquera: "",
              peso_total_kg: 0,
            },
          ],
        },
      ],
      productos: [],
      insumos: [],
    },
  );

  useEffect(() => {
    if (tipo === undefined || tipo === null || tipo === "") {
      return;
    }

    setFormData((prev) =>
      prev.tipo_documento_id === tipo
        ? prev
        : { ...prev, tipo_documento_id: tipo },
    );
  }, [tipo]);

  const [especies, setEspecies] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [motivosIngreso, setMotivosIngreso] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [espRes, varRes, tiposRes, motivosRes, clientesRes] =
          await Promise.all([
            obtenerEspecies(),
            obtenerVariantesCompletas(),
            obtenerTiposDocumentoProduccion(),
            obtenerMotivosIngreso(),
            obtenerClientes(),
          ]);
        setEspecies(espRes);
        setVariantes(varRes);
        setTiposDocumento(tiposRes || []);
        setMotivosIngreso(motivosRes || []);
        setClientes(clientesRes || []);
      } catch (error) {
        console.error("Error cargando catálogos:", error);
      } finally {
        setCargando(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // El cliente se elige del catalogo, pero el documento guarda ademas la razon
  // social del momento para no reescribir el historico si el cliente cambia.
  const handleChangeCliente = (e) => {
    const clienteId = e.target.value;
    const cliente = clientes.find(
      (c) => String(c.id) === String(clienteId),
    );
    setFormData((prev) => ({
      ...prev,
      cliente_id: clienteId,
      cliente: cliente ? cliente.razon_social : "",
    }));
  };

  const handleChangeEspecie = (val) => {
    setFormData((prev) => ({
      ...prev,
      especie_id: val,
      productos: [],
    }));
  };

  // El ensunchado ya no se define al crear la variante en el catálogo, sino
  // al momento del ingreso. Si no existe todavía la variante (misma
  // presentación/calidad/calibre) con el estado de ensunchado elegido, se crea aquí.
  const crearVarianteEnsunchado = async ({
    presentacion_id,
    calidad_id,
    calibre_id,
    ensunchado,
  }) => {
    const nuevoId = await crearVariantePresentacion({
      presentacion_id,
      calidad_id,
      calibre_id,
      ensunchado,
    });
    const variantesActualizadas = await obtenerVariantesCompletas();
    setVariantes(variantesActualizadas);
    return variantesActualizadas.find((v) => v.variante_id === nuevoId);
  };

  const calcularPesosPorCarro = () => {
    return formData.transportes.map((t) =>
      t.embarcaciones.reduce(
        (acc, e) => acc + (parseFloat(e.peso_total_kg) || 0),
        0,
      ),
    );
  };

  // Cancelar limpia todos los campos y descarta el borrador guardado sin salir
  // de la vista. En edicion, onCancel devuelve al detalle del documento.
  const confirmarCancelar = () => {
    setConfirmacionAbierta(false);
    reiniciarFormulario();
    if (onCancel) onCancel();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError(null);

    if (!formData.especie_id) {
      return setMensajeError("Debe seleccionar una especie");
    }
    if (!formData.cliente_id && !formData.cliente) {
      return setMensajeError("Debe seleccionar un cliente");
    }
    if (!formData.tipo_documento_id) {
      return setMensajeError("Debe seleccionar un tipo de documento");
    }
    if (formData.productos.length === 0) {
      return setMensajeError("Debe añadir al menos un producto");
    }

    const dataToSend = {
      ...formData,
      especie_id: parseInt(formData.especie_id),
      cliente_id: formData.cliente_id ? parseInt(formData.cliente_id, 10) : null,
      tipo_documento_id: parseInt(formData.tipo_documento_id, 10),
      entera: parseFloat(formData.entera) || 0,
      transportes: formData.transportes.map((t) => ({
        ...t,
        embarcaciones: t.embarcaciones.map((e) => ({
          ...e,
          peso_total_kg: parseFloat(e.peso_total_kg) || 0,
        })),
      })),
      productos: formData.productos.map((p) => {
        // total_cajas_reparto solo asiste el llenado en pantalla; lo que se
        // guarda son las cajas ya repartidas en cada carro.
        const producto = { ...p };
        delete producto.total_cajas_reparto;

        return {
          ...producto,
          variante_id: parseInt(producto.variante_id),
          peso_unidad: parseFloat(producto.peso_unidad) || 0,
          cajas_carros: (producto.cajas_carros || []).map(
            (cajas) => parseInt(cajas) || 0,
          ),
          peso_total_neto_kg: parseFloat(producto.peso_total_neto_kg) || 0,
          acumulado_presentacion:
            parseFloat(producto.acumulado_presentacion) || 0,
          rendimiento: parseFloat(producto.rendimiento) || 0,
          motivo_ingreso_id: formData.motivo_ingreso_id,
        };
      }),
      insumos: formData.insumos.map((i) => ({
        ...i,
        cantidad: parseInt(i.cantidad) || 0,
      })),
    };

    // Si quien recibe el envio no maneja el error, se muestra aqui mismo en vez
    // de perderse: el usuario sigue con el formulario cargado delante.
    try {
      await onSubmit(dataToSend);
    } catch (error) {
      setMensajeError(
        typeof error === "string" ? error : error?.message || String(error),
      );
    }
  };

  if (cargando) return <Loading />;

  const pesosPorCarro = calcularPesosPorCarro();
  const totalRecepcion = pesosPorCarro.reduce((acc, peso) => acc + peso, 0);
  const tipoDocumentoSeleccionado = tiposDocumento.find(
    (tipoDocumentoItem) =>
      String(tipoDocumentoItem.id) === String(formData.tipo_documento_id),
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-12 pt-10">
      {mensajeError && (
        <Alert variant="error" className="mb-4">
          {mensajeError}
        </Alert>
      )}

      <div className="doc-header mb-4 rounded-sm bg-navy px-4 py-3 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-base font-semibold tracking-tight">
            Registro de {tipoDocumentoSeleccionado?.codigo || ""}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-xs text-navy-label">
              Usuario:{" "}
              <span className="num text-navy-text">
                {formData.username || user?.username || ""}
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmacionAbierta(true)}
              className="border-steel bg-transparent text-navy-text hover:bg-navy-hover hover:text-white"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="secondary" size="sm">
              Guardar Documento
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            label="Código Documento"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
          />

          <Input
            label="Revisión"
            name="revision"
            value={formData.revision}
            onChange={handleChange}
          />
          <Input
            label="Versión"
            name="version"
            value={formData.version}
            onChange={handleChange}
          />
        </div>
      </div>

      <HeaderSection
        formData={formData}
        onChange={handleChange}
        clientes={clientes}
        onChangeCliente={handleChangeCliente}
      />

      <ReceptionSection
        especieId={formData.especie_id}
        entera={formData.entera}
        transportes={formData.transportes}
        onChangeEspecie={handleChangeEspecie}
        onChangeEntera={(val) => setFormData((p) => ({ ...p, entera: val }))}
        onChangeTransportes={(val) =>
          setFormData((p) => ({ ...p, transportes: val }))
        }
        especies={especies}
      />

      <PackedProductSection
        productos={formData.productos}
        variantes={variantes}
        especies={especies}
        especieId={formData.especie_id}
        motivoIngreso={formData.motivo_ingreso_id}
        motivos={motivosIngreso}
        onChangeProductos={(val) =>
          setFormData((p) => ({ ...p, productos: val }))
        }
        onChangeMotivoIngreso={(val) =>
          setFormData((prev) => ({ ...prev, motivo_ingreso_id: val }))
        }
        onCrearVarianteEnsunchado={crearVarianteEnsunchado}
        totalRecepcion={totalRecepcion}
        cantidadCarros={formData.transportes.length}
        pesosCarros={pesosPorCarro}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <InsumosSection
            insumos={formData.insumos}
            onChangeInsumos={(val) =>
              setFormData((p) => ({ ...p, insumos: val }))
            }
          />
        </div>

        <div className="flex flex-col border border-line bg-surface p-3 rounded-sm">
          <h2 className="label-col mb-3 border-b border-line pb-1.5">
            Observaciones
          </h2>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="6"
            className="flex-1 w-full p-3 rounded-sm border border-line focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ingrese notas o comentarios..."
          />
          <p className="mt-2 text-xs text-gray-400"></p>
        </div>
      </div>

      <Modal
        isOpen={confirmacionAbierta}
        onClose={() => setConfirmacionAbierta(false)}
        title="Cancelar registro"
        size="sm"
      >
        <p className="text-sm text-ink">
          {initialData
            ? "Se descartarán los cambios realizados en este documento."
            : "Se borrarán todos los datos ingresados en este parte de producción."}{" "}
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmacionAbierta(false)}
          >
            Volver
          </Button>
          <Button type="button" variant="danger" onClick={confirmarCancelar}>
            Si, cancelar
          </Button>
        </div>
      </Modal>
    </form>
  );
}
