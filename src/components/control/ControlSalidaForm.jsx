import { useEffect, useMemo, useState } from "react";
import { Button, Alert } from "@/components/common";
import { useAuthStore } from "@/stores";
import ControlHeaderSection from "./ControlHeaderSection";
import ControlItemsSection from "./ControlItemsSection";
import ControlObservacionesSection from "./ControlObservacionesSection";

export default function ControlSalidaForm({
  onSubmit,
  onCancel,
  especies = [],
  variantes = [],
  tipoDocumento = "EMBARQUE",
}) {
  const { user } = useAuthStore();

  const initialFormData = useMemo(
    () => ({
      numero_control: "",
      fecha: new Date().toISOString().split("T")[0],
      usuario: "",
      usuario_sistema: user?.username || "",
      fecha_produccion: "",
      turno: "",
      numero_lote: "",
      numero_camara: "",
      especie_id: "",
      observaciones: "",
      motivo_salida: "OTROS",
    }),
    [user?.username],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [items, setItems] = useState([
    {
      descripcion: "",
      codigo_trazabilidad: "",
      cantidad: 0,
      peso_unidad: 0,
      motivo_salida: "OTROS",
    },
  ]);
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);

  const variantesFiltradasPorEspecie = useMemo(() => {
    if (!formData.especie_id) {
      return [];
    }

    const especieId = parseInt(formData.especie_id, 10);
    return variantes.filter((variante) => variante.especie_id === especieId);
  }, [formData.especie_id, variantes]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      usuario_sistema: user?.username || prev.usuario_sistema,
    }));
  }, [user?.username]);

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (!item.variante_id) {
          return item;
        }

        const varianteValida = variantesFiltradasPorEspecie.some(
          (variante) => variante.variante_id === item.variante_id,
        );

        return varianteValida ? item : { ...item, variante_id: "" };
      }),
    );
  }, [variantesFiltradasPorEspecie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validar = () => {
    const nextErrors = {};

    if (!formData.numero_control.trim())
      nextErrors.numero_control = "Requerido";
    if (!formData.fecha) nextErrors.fecha = "Requerido";
    if (!formData.usuario.trim()) nextErrors.usuario = "Requerido";
    if (!formData.turno) nextErrors.turno = "Seleccione un turno";
    if (!formData.numero_lote.trim()) nextErrors.numero_lote = "Requerido";
    if (!formData.numero_camara.trim()) nextErrors.numero_camara = "Requerido";
    if (!formData.especie_id) nextErrors.especie_id = "Seleccione una especie";
    if (items.length === 0)
      nextErrors.items = "Debe registrar al menos un ítem";

    items.forEach((item, index) => {
      if (!item.variante_id) {
        nextErrors[`item_${index}_variante_id`] = "Requerido";
      }
      const cantidad = parseFloat(item.cantidad);
      const pesoUnidad = parseFloat(item.peso_unidad);
      if (Number.isNaN(cantidad) || cantidad <= 0) {
        nextErrors[`item_${index}_cantidad`] = "Debe ser mayor a 0";
      }
      if (Number.isNaN(pesoUnidad) || pesoUnidad < 0) {
        nextErrors[`item_${index}_peso_unidad`] = "Debe ser válido";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeError(null);

    if (!validar()) {
      return;
    }

    setCargando(true);
    try {
      const itemsConTotales = items.map((item, index) => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const pesoUnidad = parseFloat(item.peso_unidad) || 0;
        return {
          numero_item: index + 1,
          variante_id: item.variante_id,
          codigo_trazabilidad: item.codigo_trazabilidad?.trim() || null,
          cantidad,
          peso_unidad: pesoUnidad,
          total_kg: cantidad * pesoUnidad,
        };
      });

      const sumaCantidad = itemsConTotales.reduce(
        (total, item) => total + item.cantidad,
        0,
      );
      const sumaTotalKg = itemsConTotales.reduce(
        (total, item) => total + item.total_kg,
        0,
      );

      await onSubmit({
        tipo_documento: tipoDocumento,
        numero_control: formData.numero_control.trim(),
        fecha: formData.fecha,
        usuario: formData.usuario.trim(),
        fecha_produccion: formData.fecha_produccion || null,
        turno: formData.turno,
        numero_lote: formData.numero_lote.trim(),
        numero_camara: formData.numero_camara.trim(),
        especie_id: parseInt(formData.especie_id, 10),
        suma_cantidad: sumaCantidad,
        suma_total_kg: sumaTotalKg,
        observaciones: formData.observaciones?.trim() || null,
        motivo_salida: formData.motivo_salida,
        items: itemsConTotales,
      });
    } catch (error) {
      console.log("ERROR CRUDO:", error);
      console.log("ERROR TIPO:", typeof error);
      setMensajeError(
        typeof error === "string" ? error : JSON.stringify(error),
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-12">
      {mensajeError && (
        <Alert type="error" className="mb-4">
          {mensajeError}
        </Alert>
      )}

      <div className="bg-blue-900 text-white p-6 rounded-t-xl shadow-md mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Registro de {tipoDocumento}</h1>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <p className="text-xs text-blue-200">
                Usuario: {formData.usuario_sistema}
              </p>
              <p className="text-xs text-blue-200">
                Documento: {tipoDocumento}
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="bg-transparent border-white text-white hover:bg-blue-800 hover:text-blue-950"
              onClick={onCancel}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="primary"
              className="bg-white text-blue-900 hover:bg-transparent hover:text-white"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar Documento"}
            </Button>
          </div>
        </div>
      </div>

      <ControlHeaderSection
        formData={formData}
        onChange={handleChange}
        especies={especies}
        tipoDocumento={tipoDocumento}
        errors={errors}
      />

      <ControlItemsSection
        items={items}
        onChangeItems={setItems}
        motivoSalida={formData.motivo_salida}
        variantes={variantesFiltradasPorEspecie}
        onChangeMotivoSalida={(val) =>
          setFormData((prev) => ({ ...prev, motivo_salida: val }))
        }
        error={errors.items}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ControlObservacionesSection
          value={formData.observaciones}
          onChange={handleChange}
          tipoDocumento={tipoDocumento}
        />
      </div>
    </form>
  );
}
