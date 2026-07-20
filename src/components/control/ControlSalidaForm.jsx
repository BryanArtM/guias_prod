import { useEffect, useMemo, useState } from "react";
import { Button, Alert } from "@/components/common";
import { useAuthStore } from "@/stores";
import ControlHeaderSection from "./ControlHeaderSection";
import ControlItemsSection from "./ControlItemsSection";
import ControlObservacionesSection from "./ControlObservacionesSection";
import {
  obtenerMotivosSalida,
  obtenerTiposDocumentoSalida,
} from "@/services/api";

export default function ControlSalidaForm({
  onSubmit,
  onCancel,
  especies = [],
  variantes = [],
  tipoDocumento = "EMBARQUE",
  initialData = null,
}) {
  const { user } = useAuthStore();

  const initialFormData = useMemo(
    () =>
      initialData
        ? {
            numero_control: initialData.numero_control || "",
            fecha: initialData.fecha || "",
            cliente: initialData.cliente || "",
            tipo_documento_id: initialData.tipo_documento_id || null,
            usuario_sistema: user?.username || "",
            fecha_produccion: initialData.fecha_produccion || "",
            turno: initialData.turno || "",
            numero_lote: initialData.numero_lote || "",
            numero_camara: initialData.numero_camara || "",
            especie_id: initialData.especie_id || "",
            observaciones: initialData.observaciones || "",
            motivo_salida_id: initialData.motivo_salida || null,
          }
        : {
            numero_control: "",
            fecha: new Date().toISOString().split("T")[0],
            cliente: "",
            tipo_documento_id: null,
            usuario_sistema: user?.username || "",
            fecha_produccion: "",
            turno: "",
            numero_lote: "",
            numero_camara: "",
            especie_id: "",
            observaciones: "",
            motivo_salida_id: null,
          },
    [user?.username, initialData],
  );

  const [formData, setFormData] = useState(initialFormData);
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((it) => ({
          variante_id: it.variante_id,
          codigo_trazabilidad: it.codigo_trazabilidad || "",
          cantidad: it.cantidad,
          peso_unidad: it.peso_unidad,
          motivo_salida: "OTROS",
        }))
      : [
          {
            variante_id: "",
            codigo_trazabilidad: "",
            cantidad: 0,
            peso_unidad: 0,
            motivo_salida: "OTROS",
          },
        ],
  );
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [tiposDocumentoSalida, setTiposDocumentoSalida] = useState([]);

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
    // cuando el prop tipoDocumento cambia, intentar sincronizar tipo_documento_id si los tipos ya fueron cargados
    if (!tipoDocumento || tiposDocumentoSalida.length === 0) return;
    const match = tiposDocumentoSalida.find((t) => t.codigo === tipoDocumento);
    if (match)
      setFormData((prev) => ({ ...prev, tipo_documento_id: match.id }));
  }, [tipoDocumento, tiposDocumentoSalida]);

  useEffect(() => {
    let mounted = true;
    Promise.all([obtenerMotivosSalida(), obtenerTiposDocumentoSalida()])
      .then((res) => {
        if (!mounted) return;
        const motivosRes = res[0] || [];
        const tiposRes = res[1] || [];
        setMotivos(motivosRes);
        setTiposDocumentoSalida(tiposRes);
        // set default motivo (OTROS) if exists
        const otros = (motivosRes || []).find((m) => m.codigo === "OTROS");
        if (otros)
          setFormData((prev) => ({ ...prev, motivo_salida_id: otros.id }));
        // set default tipo_documento_id: try match prop tipoDocumento code
        const match = tiposRes.find((t) => t.codigo === tipoDocumento);
        if (match)
          setFormData((prev) => ({ ...prev, tipo_documento_id: match.id }));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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
    if (!formData.cliente?.trim()) nextErrors.cliente = "Requerido";
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
          observaciones: null,
          codigo_completo: null,
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
        tipo_documento_id: formData.tipo_documento_id,
        tipo_documento_codigo: null,
        numero_control: formData.numero_control.trim(),
        fecha: formData.fecha,
        cliente: formData.cliente.trim(),
        fecha_produccion: formData.fecha_produccion || null,
        turno: formData.turno,
        numero_lote: formData.numero_lote.trim(),
        numero_camara: formData.numero_camara.trim(),
        especie_id: parseInt(formData.especie_id, 10),
        especie_nombre: null,
        suma_cantidad: sumaCantidad,
        suma_total_kg: sumaTotalKg,
        observaciones: formData.observaciones?.trim() || null,
        motivo_salida: formData.motivo_salida_id,
        motivo_salida_codigo: null,
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
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-12 pt-10">
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
        motivoSalida={formData.motivo_salida_id}
        motivos={motivos}
        variantes={variantesFiltradasPorEspecie}
        onChangeMotivoSalida={(val) =>
          setFormData((prev) => ({ ...prev, motivo_salida_id: val }))
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
