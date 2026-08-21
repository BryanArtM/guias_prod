import { useEffect, useState } from "react";
import { Input, Button, Loading } from "@/components/common";
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
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [espRes, varRes, tiposRes, motivosRes] = await Promise.all([
          obtenerEspecies(),
          obtenerVariantesCompletas(),
          obtenerTiposDocumentoProduccion(),
          obtenerMotivosIngreso(),
        ]);
        setEspecies(espRes);
        setVariantes(varRes);
        setTiposDocumento(tiposRes || []);
        setMotivosIngreso(motivosRes || []);
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

  const calculateTotalRecepcion = () => {
    return formData.transportes.reduce((acc, t) => {
      return (
        acc +
        t.embarcaciones.reduce(
          (accE, e) => accE + (parseFloat(e.peso_total_kg) || 0),
          0,
        )
      );
    }, 0);
  };

  // Cancelar limpia todos los campos y descarta el borrador guardado sin salir
  // de la vista. En edicion, onCancel devuelve al detalle del documento.
  const handleCancel = () => {
    reiniciarFormulario();
    if (onCancel) onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.especie_id) return alert("Debe seleccionar una especie");
    if (!formData.tipo_documento_id)
      return alert("Debe seleccionar un tipo de documento");
    if (formData.productos.length === 0)
      return alert("Debe añadir al menos un producto");

    const dataToSend = {
      ...formData,
      especie_id: parseInt(formData.especie_id),
      tipo_documento_id: parseInt(formData.tipo_documento_id, 10),
      entera: parseFloat(formData.entera) || 0,
      transportes: formData.transportes.map((t) => ({
        ...t,
        embarcaciones: t.embarcaciones.map((e) => ({
          ...e,
          peso_total_kg: parseFloat(e.peso_total_kg) || 0,
        })),
      })),
      productos: formData.productos.map((p) => ({
        ...p,
        variante_id: parseInt(p.variante_id),
        peso_unidad: parseFloat(p.peso_unidad) || 0,
        cajas_carro_1: parseInt(p.cajas_carro_1) || 0,
        cajas_carro_2: parseInt(p.cajas_carro_2) || 0,
        cajas_carro_3: parseInt(p.cajas_carro_3) || 0,
        cajas_carro_4: parseInt(p.cajas_carro_4) || 0,
        peso_total_neto_kg: parseFloat(p.peso_total_neto_kg) || 0,
        acumulado_presentacion: parseFloat(p.acumulado_presentacion) || 0,
        rendimiento: parseFloat(p.rendimiento) || 0,
        motivo_ingreso_id: formData.motivo_ingreso_id,
      })),
      insumos: formData.insumos.map((i) => ({
        ...i,
        cantidad: parseInt(i.cantidad) || 0,
      })),
    };

    onSubmit(dataToSend);
  };

  if (cargando) return <Loading />;

  const totalRecepcion = calculateTotalRecepcion();
  const tipoDocumentoSeleccionado = tiposDocumento.find(
    (tipoDocumentoItem) =>
      String(tipoDocumentoItem.id) === String(formData.tipo_documento_id),
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-12 pt-10">
      <div className="doc-header mb-4 bg-navy px-4 py-3 text-white">
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
              onClick={handleCancel}
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

      <HeaderSection formData={formData} onChange={handleChange} />

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
            className="flex-1 w-full p-3 border border-line focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ingrese notas o comentarios..."
          />
          <p className="mt-2 text-xs text-gray-400"></p>
        </div>
      </div>
    </form>
  );
}
