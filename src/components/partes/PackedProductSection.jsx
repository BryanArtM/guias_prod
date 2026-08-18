import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Select } from "@/components/common";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";

const FILAS_INICIALES_POR_PRESENTACION = 10;
const PESO_UNIDAD_POR_DEFECTO = 10;

function crearFilaProducto(varianteId, pesoUnidad = PESO_UNIDAD_POR_DEFECTO) {
  return {
    variante_id: varianteId,
    peso_unidad: pesoUnidad,
    cajas_carro_1: 0,
    cajas_carro_2: 0,
    cajas_carro_3: 0,
    cajas_carro_4: 0,
    peso_total_neto_kg: 0,
    acumulado_presentacion: 0,
    rendimiento: 0,
    motivo_salida: "OTROS",
  };
}

function claveCombo(calidadId, calibreId) {
  return `${calidadId ?? "null"}-${calibreId ?? "null"}`;
}

function etiquetaBase(base) {
  const partes = [base.calidad, base.calibre].filter(Boolean);
  return partes.length > 0 ? partes.join(" · ") : "Sin calidad/calibre";
}

// Orden de columnas numéricas para la navegación con Tab/Enter: en vez de
// avanzar a la derecha (comportamiento por defecto del navegador), se
// desplaza hacia abajo dentro de la misma columna, y al llegar a la última
// fila salta al inicio de la siguiente columna. Así se puede rellenar toda
// la columna "Carro 1" de corrido antes de pasar a "Carro 2", etc.
const ORDEN_COLUMNAS_NUMERICAS = [
  "peso_unidad",
  "cajas_carro_1",
  "cajas_carro_2",
  "cajas_carro_3",
  "cajas_carro_4",
];

function idCampoNumerico(presentacionId, columna, posicion) {
  return `campo-${presentacionId}-${columna}-${posicion}`;
}

function manejarNavegacionVertical(
  evento,
  presentacionId,
  columna,
  posicion,
  totalFilas,
) {
  if (evento.key !== "Tab" && evento.key !== "Enter") {
    return;
  }
  evento.preventDefault();

  const indiceColumna = ORDEN_COLUMNAS_NUMERICAS.indexOf(columna);
  const retroceder = evento.key === "Tab" && evento.shiftKey;

  let siguienteColumna = columna;
  let siguientePosicion = retroceder ? posicion - 1 : posicion + 1;

  if (siguientePosicion < 0) {
    if (indiceColumna <= 0) return;
    siguienteColumna = ORDEN_COLUMNAS_NUMERICAS[indiceColumna - 1];
    siguientePosicion = totalFilas - 1;
  } else if (siguientePosicion >= totalFilas) {
    if (indiceColumna === -1 || indiceColumna === ORDEN_COLUMNAS_NUMERICAS.length - 1) {
      return;
    }
    siguienteColumna = ORDEN_COLUMNAS_NUMERICAS[indiceColumna + 1];
    siguientePosicion = 0;
  }

  const siguienteInput = document.getElementById(
    idCampoNumerico(presentacionId, siguienteColumna, siguientePosicion),
  );
  siguienteInput?.focus();
  siguienteInput?.select?.();
}

export default function PackedProductSection({
  productos,
  variantes = [],
  especies = [],
  especieId,
  motivoIngreso,
  onChangeMotivoIngreso,
  motivos = [],
  onChangeProductos,
  onCrearVarianteEnsunchado,
  totalRecepcion,
}) {
  const [presentacionesAbiertas, setPresentacionesAbiertas] = useState(
    new Set(),
  );
  const [filaEditandoIndex, setFilaEditandoIndex] = useState(null);
  const [filasCreandoVariante, setFilasCreandoVariante] = useState(new Set());
  const especieInicializada = useRef(null);

  const variantesFiltradas = useMemo(() => {
    if (!especieId) {
      return [];
    }

    const especieIdNumerico = parseInt(especieId, 10);
    return variantes.filter(
      (variante) => variante.especie_id === especieIdNumerico,
    );
  }, [especieId, variantes]);

  const varianteById = useMemo(() => {
    const map = new Map();
    variantesFiltradas.forEach((v) => map.set(v.variante_id, v));
    return map;
  }, [variantesFiltradas]);

  const especieSeleccionada = especies.find(
    (e) => String(e.id) === String(especieId),
  );
  const pesoUnidadInicial =
    especieSeleccionada?.peso_unidad_defecto ?? PESO_UNIDAD_POR_DEFECTO;

  // Agrupar variantes por presentación. Dentro de cada presentación se
  // deduplica por combo (calidad + calibre) ignorando el ensunchado, ya que
  // ese estado ahora se elige por fila con el checkbox, no al crear la variante.
  const presentaciones = useMemo(() => {
    const grupos = new Map();
    variantesFiltradas.forEach((v) => {
      if (!grupos.has(v.presentacion_id)) {
        grupos.set(v.presentacion_id, {
          presentacion_id: v.presentacion_id,
          presentacion_nombre: v.presentacion_nombre,
          variantesCrudas: [],
        });
      }
      grupos.get(v.presentacion_id).variantesCrudas.push(v);
    });

    return Array.from(grupos.values())
      .map((grupo) => {
        const basesPorClave = new Map();
        grupo.variantesCrudas.forEach((v) => {
          const clave = claveCombo(v.calidad_id, v.calibre_id);
          const actual = basesPorClave.get(clave);
          const esNuevaNoEnsunchada = v.tipo_ensunchado !== "Z";
          const actualEsEnsunchada = actual?.tipo_ensunchado === "Z";
          if (!actual || (actualEsEnsunchada && esNuevaNoEnsunchada)) {
            basesPorClave.set(clave, v);
          }
        });

        const bases = Array.from(basesPorClave.values()).sort((a, b) =>
          etiquetaBase(a).localeCompare(etiquetaBase(b), "es"),
        );

        return { ...grupo, bases };
      })
      .sort((a, b) =>
        a.presentacion_nombre.localeCompare(b.presentacion_nombre, "es"),
      );
  }, [variantesFiltradas]);

  // Reiniciar el acordeón al cambiar de especie
  useEffect(() => {
    setPresentacionesAbiertas(new Set());
    setFilaEditandoIndex(null);
    especieInicializada.current = null;
  }, [especieId]);

  // Al cargar un documento existente, abrir las presentaciones que ya tienen filas
  useEffect(() => {
    if (!especieId || productos.length === 0 || varianteById.size === 0) {
      return;
    }
    if (especieInicializada.current === especieId) {
      return;
    }

    const idsConFilas = new Set(
      productos
        .map((p) => varianteById.get(p.variante_id)?.presentacion_id)
        .filter(Boolean),
    );

    if (idsConFilas.size > 0) {
      setPresentacionesAbiertas(idsConFilas);
    }
    especieInicializada.current = especieId;
  }, [especieId, productos, varianteById]);

  // Recalcular rendimientos si cambia el total de recepción
  useEffect(() => {
    if (totalRecepcion > 0 && productos.length > 0) {
      const newProductos = productos.map((p) => ({
        ...p,
        rendimiento:
          ((parseFloat(p.acumulado_presentacion) || 0) * 100) / totalRecepcion,
      }));
      // Evitar bucle infinito: solo cambiar si realmente hay diferencia significativa
      if (JSON.stringify(newProductos) !== JSON.stringify(productos)) {
        onChangeProductos(newProductos);
      }
    }
  }, [totalRecepcion]);

  useEffect(() => {
    if (productos.length === 0) {
      return;
    }

    const variantesValidas = new Set(
      variantesFiltradas.map((variante) => variante.variante_id),
    );

    const productosLimpios = productos.filter((producto) =>
      variantesValidas.has(producto.variante_id),
    );

    if (productosLimpios.length !== productos.length) {
      onChangeProductos(productosLimpios);
    }
  }, [especieId, variantesFiltradas]);

  const filasDePresentacion = (presentacionId) =>
    productos.reduce((acc, p, index) => {
      if (varianteById.get(p.variante_id)?.presentacion_id === presentacionId) {
        acc.push({ producto: p, index });
      }
      return acc;
    }, []);

  // Devuelve el siguiente combo base en orden alfabético; si ya no hay más,
  // repite el último para que siempre se pueda seguir agregando filas.
  const siguienteBaseAlfabetica = (presentacion, cantidadFilasActuales) => {
    const basesOrdenadas = presentacion.bases;
    const indice = Math.min(cantidadFilasActuales, basesOrdenadas.length - 1);
    return basesOrdenadas[indice];
  };

  const togglePresentacion = (presentacion) => {
    const estaAbierta = presentacionesAbiertas.has(
      presentacion.presentacion_id,
    );

    setPresentacionesAbiertas((prev) => {
      const next = new Set(prev);
      if (estaAbierta) {
        next.delete(presentacion.presentacion_id);
      } else {
        next.add(presentacion.presentacion_id);
      }
      return next;
    });

    if (!estaAbierta) {
      const filasExistentes = filasDePresentacion(presentacion.presentacion_id);
      if (filasExistentes.length === 0) {
        const nuevasFilas = Array.from(
          { length: FILAS_INICIALES_POR_PRESENTACION },
          (_, i) =>
            crearFilaProducto(
              siguienteBaseAlfabetica(presentacion, i).variante_id,
              pesoUnidadInicial,
            ),
        );
        onChangeProductos([...productos, ...nuevasFilas]);
      }
    }
  };

  const addFilaPresentacion = (presentacion) => {
    const filasExistentes = filasDePresentacion(presentacion.presentacion_id);
    const base = siguienteBaseAlfabetica(presentacion, filasExistentes.length);
    onChangeProductos([
      ...productos,
      crearFilaProducto(base.variante_id, pesoUnidadInicial),
    ]);
  };

  const removeProducto = (index) => {
    onChangeProductos(productos.filter((_, i) => i !== index));
    setFilaEditandoIndex(null);
  };

  const updateProducto = (index, field, value) => {
    const newProductos = [...productos];
    newProductos[index] = { ...newProductos[index], [field]: value };

    // Recalcular
    const p = newProductos[index];
    const totalCajas =
      (parseInt(p.cajas_carro_1) || 0) +
      (parseInt(p.cajas_carro_2) || 0) +
      (parseInt(p.cajas_carro_3) || 0) +
      (parseInt(p.cajas_carro_4) || 0);

    p.peso_total_neto_kg = totalCajas * (parseFloat(p.peso_unidad) || 0);
    p.acumulado_presentacion = p.peso_total_neto_kg;

    p.rendimiento =
      totalRecepcion > 0
        ? (p.acumulado_presentacion * 100) / totalRecepcion
        : 0;

    onChangeProductos(newProductos);
  };

  // El ensunchado ya no es un campo de la variante que se elige al crearla en
  // el catálogo, sino un checkbox por fila. Si no existe todavía la variante
  // con ese estado para el mismo combo (calidad + calibre), se crea al vuelo.
  const toggleEnsunchado = async (index, presentacion, varianteActual) => {
    if (!varianteActual || !onCrearVarianteEnsunchado) return;

    const nuevoEstado = varianteActual.tipo_ensunchado !== "Z";
    const candidato = presentacion.variantesCrudas.find(
      (v) =>
        v.calidad_id === varianteActual.calidad_id &&
        v.calibre_id === varianteActual.calibre_id &&
        (v.tipo_ensunchado === "Z") === nuevoEstado,
    );

    if (candidato) {
      updateProducto(index, "variante_id", candidato.variante_id);
      return;
    }

    setFilasCreandoVariante((prev) => new Set(prev).add(index));
    try {
      const nuevaVariante = await onCrearVarianteEnsunchado({
        presentacion_id: presentacion.presentacion_id,
        calidad_id: varianteActual.calidad_id,
        calibre_id: varianteActual.calibre_id,
        ensunchado: nuevoEstado,
      });
      if (nuevaVariante) {
        updateProducto(index, "variante_id", nuevaVariante.variante_id);
      }
    } catch (error) {
      console.error("Error al crear la variante ensunchado:", error);
    } finally {
      setFilasCreandoVariante((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const sumas = productos.reduce(
    (acc, p) => {
      acc.cajas +=
        (parseInt(p.cajas_carro_1) || 0) +
        (parseInt(p.cajas_carro_2) || 0) +
        (parseInt(p.cajas_carro_3) || 0) +
        (parseInt(p.cajas_carro_4) || 0);
      acc.pesoNeto += parseFloat(p.peso_total_neto_kg) || 0;
      acc.rendimiento += parseFloat(p.rendimiento) || 0;
      return acc;
    },
    { cajas: 0, pesoNeto: 0, rendimiento: 0 },
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Producto empacado
      </h2>

      {!especieId ? (
        <p className="text-sm text-gray-500 py-4">
          Primero seleccione una especie para ver sus presentaciones.
        </p>
      ) : presentaciones.length === 0 ? (
        <p className="text-sm text-amber-600 py-4">
          Esta especie no tiene presentaciones con variantes registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {presentaciones.map((presentacion) => {
            const abierta = presentacionesAbiertas.has(
              presentacion.presentacion_id,
            );
            const filas = filasDePresentacion(presentacion.presentacion_id);
            const filasSumas = filas.reduce(
              (acc, { producto: p }) => {
                acc.cajas +=
                  (parseInt(p.cajas_carro_1) || 0) +
                  (parseInt(p.cajas_carro_2) || 0) +
                  (parseInt(p.cajas_carro_3) || 0) +
                  (parseInt(p.cajas_carro_4) || 0);
                acc.pesoNeto += parseFloat(p.peso_total_neto_kg) || 0;
                return acc;
              },
              { cajas: 0, pesoNeto: 0 },
            );

            return (
              <div
                key={presentacion.presentacion_id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => togglePresentacion(presentacion)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-800">
                    {abierta ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    {presentacion.presentacion_nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    {filas.length > 0
                      ? `${filas.length} fila${filas.length === 1 ? "" : "s"} · ${filasSumas.cajas} cajas · ${filasSumas.pesoNeto.toFixed(2)} kg`
                      : "Sin filas"}
                  </span>
                </button>

                {abierta && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                        <tr>
                          <th className="p-2 border">Variante</th>
                          <th className="p-2 border w-16 text-center">
                            Ensunchado
                          </th>
                          <th className="p-2 border w-24">Peso Und</th>
                          <th className="p-2 border w-20">Carro 1</th>
                          <th className="p-2 border w-20">Carro 2</th>
                          <th className="p-2 border w-20">Carro 3</th>
                          <th className="p-2 border w-20">Carro 4</th>
                          <th className="p-2 border">Total Neto (kg)</th>
                          <th className="p-2 border">Rend. (%)</th>
                          <th className="p-2 border w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filas.map(({ producto: p, index }, posEnPresentacion) => {
                          const varianteActual = varianteById.get(
                            p.variante_id,
                          );
                          const baseActual = varianteActual
                            ? presentacion.bases.find(
                                (b) =>
                                  claveCombo(b.calidad_id, b.calibre_id) ===
                                  claveCombo(
                                    varianteActual.calidad_id,
                                    varianteActual.calibre_id,
                                  ),
                              )
                            : null;
                          const estaCreandoVariante =
                            filasCreandoVariante.has(index);

                          return (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-1 border">
                                {filaEditandoIndex === index ? (
                                  <Select
                                    autoFocus
                                    value={baseActual?.variante_id ?? ""}
                                    onChange={(e) => {
                                      updateProducto(
                                        index,
                                        "variante_id",
                                        e.target.value
                                          ? parseInt(e.target.value, 10)
                                          : "",
                                      );
                                      setFilaEditandoIndex(null);
                                    }}
                                    onBlur={() => setFilaEditandoIndex(null)}
                                    className="border-none bg-transparent"
                                  >
                                    {presentacion.bases.map((base) => (
                                      <option
                                        key={base.variante_id}
                                        value={base.variante_id}
                                      >
                                        {etiquetaBase(base)}
                                      </option>
                                    ))}
                                  </Select>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setFilaEditandoIndex(index)}
                                    className="w-full text-left px-1 py-1 rounded hover:bg-blue-50 flex items-center gap-1 group"
                                    title="Cambiar variante"
                                  >
                                    <span className="truncate">
                                      {varianteActual?.codigo_completo ||
                                        "Seleccione..."}
                                    </span>
                                    <Edit2
                                      size={12}
                                      className="opacity-0 group-hover:opacity-60 shrink-0"
                                    />
                                  </button>
                                )}
                              </td>
                              <td className="p-1 border text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    varianteActual?.tipo_ensunchado === "Z"
                                  }
                                  disabled={
                                    !varianteActual || estaCreandoVariante
                                  }
                                  onChange={() =>
                                    toggleEnsunchado(
                                      index,
                                      presentacion,
                                      varianteActual,
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  title="Ensunchado (Z)"
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "peso_unidad",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                                  value={p.peso_unidad}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "peso_unidad",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "peso_unidad",
                                      posEnPresentacion,
                                      filas.length,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "cajas_carro_1",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                                  value={p.cajas_carro_1}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "cajas_carro_1",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "cajas_carro_1",
                                      posEnPresentacion,
                                      filas.length,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "cajas_carro_2",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                                  value={p.cajas_carro_2}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "cajas_carro_2",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "cajas_carro_2",
                                      posEnPresentacion,
                                      filas.length,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "cajas_carro_3",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                                  value={p.cajas_carro_3}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "cajas_carro_3",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "cajas_carro_3",
                                      posEnPresentacion,
                                      filas.length,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1 border">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "cajas_carro_4",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                                  value={p.cajas_carro_4}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "cajas_carro_4",
                                      e.target.value,
                                    )
                                  }
                                  onKeyDown={(e) =>
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "cajas_carro_4",
                                      posEnPresentacion,
                                      filas.length,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-2 border font-semibold text-blue-600 bg-blue-50/30">
                                {p.peso_total_neto_kg?.toFixed(2)}
                              </td>
                              <td className="p-2 border font-semibold text-green-600 bg-green-50/30">
                                {p.rendimiento?.toFixed(2)}%
                              </td>
                              <td className="p-2 border text-center">
                                <button
                                  type="button"
                                  onClick={() => removeProducto(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="p-2 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={<Plus size={14} />}
                        iconPosition="left"
                        onClick={() => addFilaPresentacion(presentacion)}
                      >
                        Añadir variante
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {productos.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 font-bold text-sm">
          <span>TOTALES:</span>
          <span className="text-blue-800">{sumas.cajas} cajas</span>
          <span className="text-blue-800">{sumas.pesoNeto.toFixed(2)} kg</span>
          <span className="text-green-800">{sumas.rendimiento.toFixed(2)}%</span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm font-medium text-gray-700">
          Motivo de Ingreso:
        </span>
        <div className="flex gap-2">
          {motivos.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMotivoIngreso(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                motivoIngreso === m.id
                  ? "bg-blue-900 text-white border-blue-900"
                  : "text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {m.codigo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
