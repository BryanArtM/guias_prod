import { useEffect, useState } from "react";
import { Input, Button, Loading, Select } from "@/components/common";
import ReceptionSection from "./ReceptionSection";
import PackedProductSection from "./PackedProductSection";
import InsumosSection from "./InsumosSection";
import HeaderSection from "./HeaderSection";

import {
  obtenerEspecies,
  obtenerVariantesCompletas,
  obtenerTiposDocumentoProduccion,
} from "@/services";
import { useAuthStore } from "@/stores";

export default function ParteProduccionForm({
  tipo,
  onSubmit,
  initialData = null,
}) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState(
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
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [espRes, varRes, tiposRes] = await Promise.all([
          obtenerEspecies(),
          obtenerVariantesCompletas(),
          obtenerTiposDocumentoProduccion(),
        ]);
        setEspecies(espRes);
        setVariantes(varRes);
        setTiposDocumento(tiposRes || []);
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
      <div className="bg-blue-900 text-white p-6 rounded-t-xl shadow-md mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">
            Registro de {tipoDocumentoSeleccionado?.codigo || ""}
          </h1>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-xs text-blue-200">
                Usuario: {formData.username || user?.username || ""}
              </p>
            </div>
            <Button
              type="submit"
              variant="primary"
              className="bg-white text-blue-900 hover:bg-transparent hover:text-white"
            >
              Guardar Documento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Input
            label="Código Documento"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            className="bg-blue-800 border-blue-700 text-white placeholder-blue-300"
          />

          <Input
            label="Revisión"
            name="revision"
            value={formData.revision}
            onChange={handleChange}
            className="bg-blue-800 border-blue-700 text-white placeholder-blue-300"
          />
          <Input
            label="Versión"
            name="version"
            value={formData.version}
            onChange={handleChange}
            className="bg-blue-800 border-blue-700 text-white"
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
        especieId={formData.especie_id}
        onChangeProductos={(val) =>
          setFormData((p) => ({ ...p, productos: val }))
        }
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
            Observaciones
          </h2>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            rows="6"
            className="flex-1 w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ingrese notas o comentarios..."
          />
          <p className="mt-2 text-xs text-gray-400"></p>
        </div>
      </div>
    </form>
  );
}
