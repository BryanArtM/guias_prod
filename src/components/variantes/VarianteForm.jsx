import { useState, useEffect } from "react";
import { Select, Button } from "@/components/common";

export default function VarianteForm({
  onSubmit,
  onCancel,
  varianteInicial = null,
  especies = [],
  formasEnvasado = [],
  formasEmpacado = [],
  calidades = [],
  calibres = [],
}) {
  const [formData, setFormData] = useState({
    especie_id: "",
    presentacion_id: "",
    forma_envasado_id: "",
    forma_empacado_id: "",
    ensunchado: false,
    calidad_id: "",
    calibre_id: "",
    observaciones: "",
  });

  const [presentaciones, setPresentaciones] = useState([]);
  const [cargandoPresentaciones, setCargandoPresentaciones] = useState(false);
  const [codigoPreview, setCodigoPreview] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (varianteInicial) {
      setFormData({
        especie_id: varianteInicial.especie_id || "",
        presentacion_id: varianteInicial.presentacion_id || "",
        forma_envasado_id: varianteInicial.forma_envasado_id || "",
        forma_empacado_id: varianteInicial.forma_empacado_id || "",
        ensunchado: varianteInicial.ensunchado || false,
        calidad_id: varianteInicial.calidad_id || "",
        calibre_id: varianteInicial.calibre_id || "",
        observaciones: varianteInicial.observaciones || "",
      });
    }
  }, [varianteInicial]);

  // Cargar presentaciones cuando cambia la especie
  useEffect(() => {
    const cargarPresentaciones = async () => {
      if (!formData.especie_id) {
        setPresentaciones([]);
        return;
      }
      setCargandoPresentaciones(true);
      try {
        const { obtenerPresentacionesPorEspecie } =
          await import("../../services/api");
        const data = await obtenerPresentacionesPorEspecie(
          parseInt(formData.especie_id),
        );
        setPresentaciones(data);
      } catch (error) {
        console.error("VarianteForm: Error al cargar presentaciones:", error);
        setPresentaciones([]);
      } finally {
        setCargandoPresentaciones(false);
      }
    };

    cargarPresentaciones();
  }, [formData.especie_id]);

  // Generar preview del código
  useEffect(() => {
    const partes = [];

    // Especie
    const especie = especies.find(
      (e) => e.id === parseInt(formData.especie_id),
    );
    if (especie) partes.push(especie.nombre);

    // Presentación
    const presentacion = presentaciones.find(
      (p) => p.id === parseInt(formData.presentacion_id),
    );
    if (presentacion) partes.push(presentacion.nombre);

    // Forma Envasado
    const formaEnv = formasEnvasado.find(
      (f) => f.id === parseInt(formData.forma_envasado_id),
    );
    if (formaEnv) partes.push(formaEnv.nombre);

    // Forma Empacado
    const formaEmp = formasEmpacado.find(
      (f) => f.id === parseInt(formData.forma_empacado_id),
    );
    if (formaEmp) partes.push(formaEmp.nombre);

    // Ensunchado
    if (formData.ensunchado) {
      partes.push("Z");
    }

    // Calidad
    const calidad = calidades.find(
      (c) => c.id === parseInt(formData.calidad_id),
    );
    if (calidad) partes.push(calidad.nombre);

    // Calibre
    const calibre = calibres.find(
      (c) => c.id === parseInt(formData.calibre_id),
    );
    if (calibre) {
      if (calibre.valor_minimo && calibre.valor_maximo) {
        partes.push(`${calibre.valor_minimo}-${calibre.valor_maximo}`);
      } else if (calibre.valor_minimo) {
        partes.push(`${calibre.valor_minimo}+`);
      } else if (calibre.valor_maximo) {
        partes.push(`0-${calibre.valor_maximo}`);
      }
    }

    setCodigoPreview(
      partes.join(" ") || "Seleccione los campos para ver el código...",
    );
  }, [
    formData,
    especies,
    presentaciones,
    formasEnvasado,
    formasEmpacado,
    calidades,
    calibres,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si cambia la especie, limpiar la presentación
    if (name === "especie_id") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        presentacion_id: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.presentacion_id) {
      nuevosErrores.presentacion_id = "Debe seleccionar una presentación";
    }

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
      const dataToSend = {
        presentacion_id: parseInt(formData.presentacion_id),
        forma_envasado_id: formData.forma_envasado_id
          ? parseInt(formData.forma_envasado_id)
          : null,
        forma_empacado_id: formData.forma_empacado_id
          ? parseInt(formData.forma_empacado_id)
          : null,
        ensunchado: formData.ensunchado,
        calidad_id: formData.calidad_id ? parseInt(formData.calidad_id) : null,
        calibre_id: formData.calibre_id ? parseInt(formData.calibre_id) : null,
        observaciones: formData.observaciones || null,
      };

      await onSubmit(dataToSend);
    } catch (error) {
      throw error;
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 1. Especie */}
      <Select
        label="Especie"
        name="especie_id"
        value={formData.especie_id}
        onChange={handleChange}
        required
      >
        <option value="">
          {especies.length === 0
            ? "No hay especies disponibles - Cree una primero"
            : "Seleccione una especie"}
        </option>
        {especies.map((especie) => (
          <option key={especie.id} value={especie.id}>
            {especie.nombre}
          </option>
        ))}
      </Select>

      {especies.length === 0 && (
        <p className="text-sm text-amber-600 mt-1">
          Debe crear al menos una especie antes de crear variantes.{" "}
          <a href="/especies" className="underline hover:text-amber-800">
            Ir a Especies
          </a>
        </p>
      )}

      {/* 2. Presentación (filtrada por especie) */}
      <Select
        label="Presentación"
        name="presentacion_id"
        value={formData.presentacion_id}
        onChange={handleChange}
        error={errores.presentacion_id}
        required
        disabled={!formData.especie_id || cargandoPresentaciones}
      >
        <option value="">
          {cargandoPresentaciones
            ? "Cargando..."
            : formData.especie_id
              ? "Seleccione una presentación"
              : "Primero seleccione una especie"}
        </option>
        {presentaciones.map((presentacion) => (
          <option key={presentacion.id} value={presentacion.id}>
            {presentacion.nombre}
          </option>
        ))}
      </Select>

      {/* 3. Forma de Envasado */}
      <Select
        label="Forma de Envasado"
        name="forma_envasado_id"
        value={formData.forma_envasado_id}
        onChange={handleChange}
      >
        <option value="">Ninguna</option>
        {formasEnvasado.map((forma) => (
          <option key={forma.id} value={forma.id}>
            {forma.nombre} {forma.descripcion && `- ${forma.descripcion}`}
          </option>
        ))}
      </Select>

      {/* 4. Forma de Empacado */}
      <Select
        label="Forma de Empacado"
        name="forma_empacado_id"
        value={formData.forma_empacado_id}
        onChange={handleChange}
      >
        <option value="">Ninguna</option>
        {formasEmpacado.map((forma) => (
          <option key={forma.id} value={forma.id}>
            {forma.nombre} {forma.descripcion && `- ${forma.descripcion}`}
          </option>
        ))}
      </Select>

      {/* 5. Ensunchado */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="ensunchado"
          name="ensunchado"
          checked={formData.ensunchado}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label
          htmlFor="ensunchado"
          className="text-sm font-medium text-gray-700"
        >
          Ensunchado (Z)
        </label>
      </div>

      {/* 6. Calidad */}
      <Select
        label="Calidad"
        name="calidad_id"
        value={formData.calidad_id}
        onChange={handleChange}
      >
        <option value="">Ninguna</option>
        {calidades.map((calidad) => (
          <option key={calidad.id} value={calidad.id}>
            {calidad.nombre} {calidad.descripcion && `- ${calidad.descripcion}`}
          </option>
        ))}
      </Select>

      {/* 7. Calibre */}
      <Select
        label="Calibre"
        name="calibre_id"
        value={formData.calibre_id}
        onChange={handleChange}
      >
        <option value="">Ninguno</option>
        {calibres.map((calibre) => (
          <option key={calibre.id} value={calibre.id}>
            {calibre.valor_minimo && calibre.valor_maximo
              ? `${calibre.valor_minimo} - ${calibre.valor_maximo}`
              : calibre.valor_minimo
                ? `${calibre.valor_minimo}+`
                : calibre.valor_maximo
                  ? `0 - ${calibre.valor_maximo}`
                  : "Sin rango"}
          </option>
        ))}
      </Select>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Notas adicionales (opcional)"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={cargando}>
          {cargando ? "Guardando..." : varianteInicial ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
