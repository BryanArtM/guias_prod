import { useEffect, useMemo, useState } from "react";
import { Button, Alert } from "@/components/common";
import { useAuthStore } from "@/stores";
import ControlHeaderSection from "./ControlHeaderSection";
import ControlItemsSection from "./ControlItemsSection";
import ControlObservacionesSection from "./ControlObservacionesSection";
import {
  obtenerMotivosSalida,
  obtenerTiposDocumentoSalida,
  obtenerStockPorLote,
} from "@/services/api";

export default function ControlSalidaForm({
  onSubmit,
  onCancel,
  especies = [],
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
  // Las filas se arman desde el acordeón de presentaciones, por eso arranca vacío
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((it) => ({
          variante_id: it.variante_id,
          fecha_ingreso: it.fecha_ingreso || "",
          codigo_trazabilidad: it.codigo_trazabilidad || "",
          cantidad: it.cantidad,
          peso_unidad: it.peso_unidad,
          motivo_salida: "OTROS",
        }))
      : [],
  );
  const [errors, setErrors] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState(null);
  const [motivos, setMotivos] = useState([]);
  const [tiposDocumentoSalida, setTiposDocumentoSalida] = useState([]);
  const [lotes, setLotes] = useState([]);

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
    Promise.all([
      obtenerMotivosSalida(),
      obtenerTiposDocumentoSalida(),
      obtenerStockPorLote(),
    ])
      .then((res) => {
        if (!mounted) return;
        const motivosRes = res[0] || [];
        const tiposRes = res[1] || [];
        setMotivos(motivosRes);
        setTiposDocumentoSalida(tiposRes);
        setLotes(res[2] || []);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Al cambiar de especie las filas dejan de corresponder: se limpian
    if (name === "especie_id" && value !== formData.especie_id) {
      setItems([]);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const itemsConCantidad = () =>
    items.filter((item) => (parseFloat(item.cantidad) || 0) > 0);

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

    // Las filas se precargan en 0 al desplegar una presentación: las que quedan
    // en 0 se consideran no utilizadas y no se guardan.
    const itemsAGuardar = itemsConCantidad();
    if (itemsAGuardar.length === 0) {
      nextErrors.items =
        "Indique la cantidad de al menos un lote para poder guardar";
    }

    const problemas = [];
    itemsAGuardar.forEach((item) => {
      const etiqueta = `${item.fecha_ingreso || "sin fecha"}`;
      if (!item.variante_id) problemas.push(`Falta la variante (${etiqueta})`);
      if (!item.fecha_ingreso)
        problemas.push("Falta la fecha de ingreso de un lote");
      const pesoUnidad = parseFloat(item.peso_unidad);
      if (Number.isNaN(pesoUnidad) || pesoUnidad <= 0) {
        problemas.push(`Peso por unidad inválido (${etiqueta})`);
      }
    });

    if (problemas.length > 0) {
      nextErrors.items = problemas.join(". ");
    }

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
      const itemsConTotales = itemsConCantidad().map((item, index) => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const pesoUnidad = parseFloat(item.peso_unidad) || 0;
        return {
          numero_item: index + 1,
          variante_id: item.variante_id,
          fecha_ingreso: item.fecha_ingreso || null,
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
        <Alert variant="error" className="mb-4">
          {mensajeError}
        </Alert>
      )}

      <div className="doc-header mb-4 bg-navy px-4 py-3 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-base font-semibold tracking-tight">
            Registro de {tipoDocumento}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-xs text-navy-label">
              Usuario:{" "}
              <span className="num text-navy-text">
                {formData.usuario_sistema}
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="border-steel bg-transparent text-navy-text hover:bg-navy-hover hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
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
        lotes={lotes}
        especieId={formData.especie_id}
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
