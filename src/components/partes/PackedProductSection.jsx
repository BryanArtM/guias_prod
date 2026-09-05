import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Select } from "@/components/common";
import {
  TableModular,
  TableHeader,
  TableHead,
} from "@/components/common/Table";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";

const FILAS_INICIALES_POR_PRESENTACION = 10;
const PESO_UNIDAD_POR_DEFECTO = 10;

function ajustarCajasCarros(cajasCarros, cantidadCarros) {
  const actuales = Array.isArray(cajasCarros) ? cajasCarros : [];
  return Array.from({ length: cantidadCarros }, (_, i) => actuales[i] ?? 0);
}

function sumarCajas(producto) {
  if (!Array.isArray(producto.cajas_carros)) return 0;
  return producto.cajas_carros.reduce(
    (total, cajas) => total + (parseInt(cajas) || 0),
    0,
  );
}

function pesoNetoFila(producto) {
  return sumarCajas(producto) * (parseFloat(producto.peso_unidad) || 0);
}

function totalCajasVisible(producto) {
  return producto.total_cajas_reparto ?? (sumarCajas(producto) || "");
}

function repartirCajasEntreCarros(totalCajas, pesosPorCarro) {
  const cantidadCarros = pesosPorCarro.length;
  if (cantidadCarros === 0) {
    return [];
  }

  const pesoTotal = pesosPorCarro.reduce((acc, peso) => acc + peso, 0);
  if (pesoTotal <= 0) {
    return Array.from({ length: cantidadCarros }, () => 0);
  }

  const reparto = [];
  let asignadas = 0;
  for (let indiceCarro = 0; indiceCarro < cantidadCarros - 1; indiceCarro += 1) {
    const cajas = Math.trunc(
      (totalCajas * pesosPorCarro[indiceCarro]) / pesoTotal,
    );
    reparto.push(cajas);
    asignadas += cajas;
  }
  reparto.push(totalCajas - asignadas);

  return reparto;
}

// El acumulado y el rendimiento se miden por presentacion completa
function recalcularDerivados(productos, totalRecepcion, varianteById) {
  const presentacionDeFila = (producto) =>
    varianteById.get(producto.variante_id)?.presentacion_id ?? null;

  const conPeso = productos.map((producto) => ({
    ...producto,
    peso_total_neto_kg: pesoNetoFila(producto),
  }));

  const acumuladoPorPresentacion = new Map();
  conPeso.forEach((producto) => {
    const presentacionId = presentacionDeFila(producto);
    acumuladoPorPresentacion.set(
      presentacionId,
      (acumuladoPorPresentacion.get(presentacionId) || 0) +
        producto.peso_total_neto_kg,
    );
  });

  return conPeso.map((producto) => {
    const acumulado =
      acumuladoPorPresentacion.get(presentacionDeFila(producto)) || 0;
    return {
      ...producto,
      acumulado_presentacion: acumulado,
      rendimiento: totalRecepcion > 0 ? (acumulado * 100) / totalRecepcion : 0,
    };
  });
}

function crearFilaProducto(
  varianteId,
  pesoUnidad = PESO_UNIDAD_POR_DEFECTO,
  cantidadCarros = 0,
) {
  return {
    variante_id: varianteId,
    peso_unidad: pesoUnidad,
    cajas_carros: ajustarCajasCarros([], cantidadCarros),
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
function ordenColumnasNumericas(cantidadCarros) {
  return [
    "peso_unidad",
    "total_cajas",
    ...Array.from({ length: cantidadCarros }, (_, i) => `carro_${i}`),
  ];
}

function idCampoNumerico(presentacionId, columna, posicion) {
  return `campo-${presentacionId}-${columna}-${posicion}`;
}

function manejarNavegacionVertical(
  evento,
  presentacionId,
  columna,
  posicion,
  totalFilas,
  ordenColumnas,
) {
  if (evento.key !== "Tab" && evento.key !== "Enter") {
    return;
  }
  evento.preventDefault();

  const indiceColumna = ordenColumnas.indexOf(columna);
  const retroceder = evento.key === "Tab" && evento.shiftKey;

  let siguienteColumna = columna;
  let siguientePosicion = retroceder ? posicion - 1 : posicion + 1;

  if (siguientePosicion < 0) {
    if (indiceColumna <= 0) return;
    siguienteColumna = ordenColumnas[indiceColumna - 1];
    siguientePosicion = totalFilas - 1;
  } else if (siguientePosicion >= totalFilas) {
    if (indiceColumna === -1 || indiceColumna === ordenColumnas.length - 1) {
      return;
    }
    siguienteColumna = ordenColumnas[indiceColumna + 1];
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
  cantidadCarros = 0,
  pesosCarros = [],
}) {
  const [presentacionesAbiertas, setPresentacionesAbiertas] = useState(
    new Set(),
  );
  const [filaEditandoIndex, setFilaEditandoIndex] = useState(null);
  const [filasCreandoVariante, setFilasCreandoVariante] = useState(new Set());
  const especieInicializada = useRef(null);

  const valorTotalAlEnfocar = useRef(null);

  const pesosPorCarro = Array.from(
    { length: cantidadCarros },
    (_, indiceCarro) => parseFloat(pesosCarros[indiceCarro]) || 0,
  );

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

  const aplicarProductos = (lista) =>
    onChangeProductos(recalcularDerivados(lista, totalRecepcion, varianteById));

  // Recalcular rendimientos si cambia el total de recepción
  useEffect(() => {
    if (totalRecepcion > 0 && productos.length > 0) {
      const newProductos = recalcularDerivados(
        productos,
        totalRecepcion,
        varianteById,
      );
      // Evitar bucle infinito: solo cambiar si realmente hay diferencia significativa
      if (JSON.stringify(newProductos) !== JSON.stringify(productos)) {
        onChangeProductos(newProductos);
      }
    }
  }, [totalRecepcion]);

  // Cada fila lleva una casilla por carro registrado en la recepción. Al agregar
  // o quitar transportes hay que reajustar las filas ya cargadas.
  useEffect(() => {
    if (productos.length === 0) {
      return;
    }

    const necesitaAjuste = productos.some(
      (producto) =>
        !Array.isArray(producto.cajas_carros) ||
        producto.cajas_carros.length !== cantidadCarros,
    );

    if (!necesitaAjuste) {
      return;
    }

    aplicarProductos(
      productos.map((producto) => ({
        ...producto,
        cajas_carros: ajustarCajasCarros(producto.cajas_carros, cantidadCarros),
      })),
    );
  }, [cantidadCarros, productos, totalRecepcion]);

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
      aplicarProductos(productosLimpios);
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
              cantidadCarros,
            ),
        );
        aplicarProductos([...productos, ...nuevasFilas]);
      }
    }
  };

  const addFilaPresentacion = (presentacion) => {
    const filasExistentes = filasDePresentacion(presentacion.presentacion_id);
    const base = siguienteBaseAlfabetica(presentacion, filasExistentes.length);
    aplicarProductos([
      ...productos,
      crearFilaProducto(base.variante_id, pesoUnidadInicial, cantidadCarros),
    ]);
  };

  const removeProducto = (index) => {
    aplicarProductos(productos.filter((_, i) => i !== index));
    setFilaEditandoIndex(null);
  };

  const updateProducto = (index, field, value) => {
    const newProductos = [...productos];
    newProductos[index] = { ...newProductos[index], [field]: value };
    aplicarProductos(newProductos);
  };

  const updateCajasCarro = (index, indiceCarro, value) => {
    const cajasCarros = ajustarCajasCarros(
      productos[index].cajas_carros,
      cantidadCarros,
    );
    cajasCarros[indiceCarro] = value;
    updateProducto(index, "cajas_carros", cajasCarros);
  };

  // El total ingresado se reparte entre los carros solo al confirmar el campo
  // (Enter o al salir habiendolo modificado), nunca mientras se escribe.
  const repartirEnCarros = (index) => {
    const totalCajas = parseInt(totalCajasVisible(productos[index]), 10);
    if (Number.isNaN(totalCajas)) {
      return;
    }

    updateProducto(
      index,
      "cajas_carros",
      repartirCajasEntreCarros(totalCajas, pesosPorCarro),
    );
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

  // Los totales se expresan siempre en kg; el rendimiento global se calcula
  // sobre el peso neto acumulado, no sumando los rendimientos por presentacion.
  const pesoNetoTotal = productos.reduce(
    (acc, p) => acc + (parseFloat(p.peso_total_neto_kg) || 0),
    0,
  );
  const rendimientoTotal =
    totalRecepcion > 0 ? (pesoNetoTotal * 100) / totalRecepcion : 0;

  const ordenColumnas = ordenColumnasNumericas(cantidadCarros);

  return (
    <div className="mb-4 border border-line bg-surface p-3 rounded-sm">
      <h2 className="label-col mb-3 border-b border-line pb-1.5">
        Producto empacado
      </h2>

      {!especieId ? (
        <p className="text-sm text-gray-500 py-4">
          Primero seleccione una especie para ver sus presentaciones.
        </p>
      ) : presentaciones.length === 0 ? (
        <p className="py-3 text-sm text-warn">
          Esta especie no tiene presentaciones con variantes registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {presentaciones.map((presentacion) => {
            const abierta = presentacionesAbiertas.has(
              presentacion.presentacion_id,
            );
            const filas = filasDePresentacion(presentacion.presentacion_id);
            const pesoNetoPresentacion = filas.reduce(
              (acc, { producto: p }) =>
                acc + (parseFloat(p.peso_total_neto_kg) || 0),
              0,
            );
            const rendimientoPresentacion =
              totalRecepcion > 0
                ? (pesoNetoPresentacion * 100) / totalRecepcion
                : 0;

            return (
              <div
                key={presentacion.presentacion_id}
                className="border border-line overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => togglePresentacion(presentacion)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="flex items-center gap-2 font-medium text-ink">
                    {abierta ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    {presentacion.presentacion_nombre}
                  </span>
                  <span className="text-xs text-gray-500">
                    {filas.length > 0
                      ? `${filas.length} fila${filas.length === 1 ? "" : "s"} · ${pesoNetoPresentacion.toFixed(2)} kg · ${rendimientoPresentacion.toFixed(2)}%`
                      : "Sin filas"}
                  </span>
                </button>

                {abierta && (
                  <div className="overflow-x-auto">
                    <TableModular className="table--bordered text-left">
                      <TableHeader>
                        <tr>
                          <TableHead>Variante</TableHead>
                          <TableHead className="w-16 text-center">
                            Ensunchado
                          </TableHead>
                          <TableHead className="w-24">Peso Und</TableHead>
                          <TableHead className="w-24 bg-navy-bg text-ink ">
                            Total cajas
                          </TableHead>
                          {Array.from(
                            { length: cantidadCarros },
                            (_, indiceCarro) => (
                              <TableHead
                                key={indiceCarro}
                                className="w-20"
                              >{`Carro ${indiceCarro + 1}`}</TableHead>
                            ),
                          )}
                          <TableHead>Total Neto (kg)</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </tr>
                      </TableHeader>
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
                          // El efecto que sincroniza las filas con los carros
                          // corre despues del render, asi que aqui se ajusta
                          // tambien para no desalinear celdas y cabeceras.
                          const cajasCarros = ajustarCajasCarros(
                            p.cajas_carros,
                            cantidadCarros,
                          );

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
                                    className="w-full text-left px-1 py-1 hover:bg-blue-50 flex items-center gap-1 group"
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
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-line focus:ring-blue-500 focus:ring-2"
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
                                      ordenColumnas,
                                    )
                                  }
                                />
                              </td>
                              <td className="p-1 bg-navy-bg">
                                <input
                                  id={idCampoNumerico(
                                    presentacion.presentacion_id,
                                    "total_cajas",
                                    posEnPresentacion,
                                  )}
                                  type="number"
                                  className="w-full p-1 border-none bg-transparent font-semibold text-ink focus:ring-0"
                                  value={totalCajasVisible(p)}
                                  onFocus={(e) => {
                                    valorTotalAlEnfocar.current = e.target.value;
                                  }}
                                  onChange={(e) =>
                                    updateProducto(
                                      index,
                                      "total_cajas_reparto",
                                      e.target.value,
                                    )
                                  }
                                  onBlur={(e) => {
                                    if (
                                      e.target.value !==
                                      valorTotalAlEnfocar.current
                                    ) {
                                      repartirEnCarros(index);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      repartirEnCarros(index);
                                      valorTotalAlEnfocar.current =
                                        e.target.value;
                                    }
                                    manejarNavegacionVertical(
                                      e,
                                      presentacion.presentacion_id,
                                      "total_cajas",
                                      posEnPresentacion,
                                      filas.length,
                                      ordenColumnas,
                                    );
                                  }}
                                />
                              </td>
                              {cajasCarros.map((cajas, indiceCarro) => (
                                <td key={indiceCarro} className="p-1 border">
                                  <input
                                    id={idCampoNumerico(
                                      presentacion.presentacion_id,
                                      `carro_${indiceCarro}`,
                                      posEnPresentacion,
                                    )}
                                    type="number"
                                    className="w-full p-1 border-none bg-transparent focus:ring-0"
                                    value={cajas}
                                    onChange={(e) =>
                                      updateCajasCarro(
                                        index,
                                        indiceCarro,
                                        e.target.value,
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      manejarNavegacionVertical(
                                        e,
                                        presentacion.presentacion_id,
                                        `carro_${indiceCarro}`,
                                        posEnPresentacion,
                                        filas.length,
                                        ordenColumnas,
                                      )
                                    }
                                  />
                                </td>
                              ))}
                              <td className="num p-2 border text-right font-medium">
                                {p.peso_total_neto_kg?.toFixed(2)}
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
                    </TableModular>

                    <div className="p-2 border-t border-line">
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
        <div className="mt-4 flex flex-wrap items-center gap-6 border border-line bg-gray-50 px-3 py-2 rounded-sm">
          <span className="label-col">Totales</span>
          <span className="flex items-baseline gap-1.5">
            <span className="label-col">Peso neto</span>
            <span className="num font-medium">
              {pesoNetoTotal.toFixed(2)} kg
            </span>
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="label-col">Rendimiento</span>
            <span className="num font-medium">
              {rendimientoTotal.toFixed(2)}%
            </span>
          </span>
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
              className={`border px-2.5 py-1 text-xs font-medium tracking-[0.06em] uppercase transition-colors ${
                motivoIngreso === m.id
                  ? "border-navy bg-navy text-white"
                  : "border-line text-ink-muted hover:border-steel hover:text-ink"
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
