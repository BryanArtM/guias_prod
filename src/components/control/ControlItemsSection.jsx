import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Select } from "@/components/common";
import {
  TableModular,
  TableHeader,
  TableHead,
} from "@/components/common/Table";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";

const FILAS_INICIALES_POR_PRESENTACION = 5;

function claveLote(varianteId, fechaIngreso) {
  return `${varianteId}|${fechaIngreso ?? ""}`;
}

function crearItemDesdeLote(lote) {
  return {
    variante_id: lote.variante_id,
    fecha_ingreso: lote.fecha_ingreso,
    codigo_trazabilidad: "",
    cantidad: 0,
    peso_unidad: lote.peso_unidad ?? 0,
    motivo_salida: "OTROS",
  };
}

export default function ControlItemsSection({
  items,
  onChangeItems,
  motivoSalida,
  onChangeMotivoSalida,
  motivos = [],
  lotes = [],
  especieId,
  error,
}) {
  const [presentacionesAbiertas, setPresentacionesAbiertas] = useState(
    new Set(),
  );
  const [filaEditandoIndex, setFilaEditandoIndex] = useState(null);
  // Filtros de calidad/calibre por presentación
  const [filtros, setFiltros] = useState({});
  const especieInicializada = useRef(null);

  const lotesDeEspecie = useMemo(() => {
    if (!especieId) return [];
    const id = parseInt(especieId, 10);
    return lotes.filter((lote) => lote.especie_id === id);
  }, [especieId, lotes]);

  const loteByClave = useMemo(() => {
    const map = new Map();
    lotesDeEspecie.forEach((lote) =>
      map.set(claveLote(lote.variante_id, lote.fecha_ingreso), lote),
    );
    return map;
  }, [lotesDeEspecie]);

  // Agrupar los lotes por presentación; dentro de cada una se ordenan de la
  // fecha de ingreso más antigua a la más reciente para despachar por FIFO.
  const presentaciones = useMemo(() => {
    const grupos = new Map();
    lotesDeEspecie.forEach((lote) => {
      if (!grupos.has(lote.presentacion_id)) {
        grupos.set(lote.presentacion_id, {
          presentacion_id: lote.presentacion_id,
          presentacion_nombre: lote.presentacion_nombre,
          lotes: [],
        });
      }
      grupos.get(lote.presentacion_id).lotes.push(lote);
    });

    return Array.from(grupos.values())
      .map((grupo) => {
        const lotesOrdenados = [...grupo.lotes].sort(
          (a, b) =>
            a.fecha_ingreso.localeCompare(b.fecha_ingreso) ||
            a.codigo_completo.localeCompare(b.codigo_completo, "es"),
        );
        const calidades = [
          ...new Map(
            lotesOrdenados
              .filter((l) => l.calidad_id != null)
              .map((l) => [l.calidad_id, l.calidad]),
          ),
        ];
        const calibres = [
          ...new Map(
            lotesOrdenados
              .filter((l) => l.calibre_id != null)
              .map((l) => [l.calibre_id, l.calibre]),
          ),
        ];
        return { ...grupo, lotes: lotesOrdenados, calidades, calibres };
      })
      .sort((a, b) =>
        a.presentacion_nombre.localeCompare(b.presentacion_nombre, "es"),
      );
  }, [lotesDeEspecie]);

  // Reiniciar el acordeón al cambiar de especie
  useEffect(() => {
    setPresentacionesAbiertas(new Set());
    setFilaEditandoIndex(null);
    setFiltros({});
    especieInicializada.current = null;
  }, [especieId]);

  // Al editar un documento existente, abrir las presentaciones que ya tienen filas
  useEffect(() => {
    if (!especieId || items.length === 0 || loteByClave.size === 0) return;
    if (especieInicializada.current === especieId) return;

    const idsConFilas = new Set(
      items
        .map(
          (it) =>
            loteByClave.get(claveLote(it.variante_id, it.fecha_ingreso))
              ?.presentacion_id,
        )
        .filter(Boolean),
    );
    if (idsConFilas.size > 0) setPresentacionesAbiertas(idsConFilas);
    especieInicializada.current = especieId;
  }, [especieId, items, loteByClave]);

  const filtroDe = (presentacionId) =>
    filtros[presentacionId] ?? { calidad_id: "", calibre_id: "" };

  const hayFiltroActivo = (filtro) =>
    Boolean(filtro.calidad_id || filtro.calibre_id);

  const coincideFiltro = (lote, filtro) => {
    if (!lote) return false;
    if (
      filtro.calidad_id &&
      String(lote.calidad_id) !== String(filtro.calidad_id)
    ) {
      return false;
    }
    if (
      filtro.calibre_id &&
      String(lote.calibre_id) !== String(filtro.calibre_id)
    ) {
      return false;
    }
    return true;
  };

  // Lotes que se pueden despachar: los agotados no se ofrecen, pero siguen
  // resolviéndose para mostrar filas que ya los referencian.
  const lotesFiltrados = (presentacion) => {
    const filtro = filtroDe(presentacion.presentacion_id);
    return presentacion.lotes.filter(
      (lote) => lote.stock_cajas > 0 && coincideFiltro(lote, filtro),
    );
  };

  const filasDePresentacion = (presentacionId) =>
    items.reduce((acc, item, index) => {
      const lote = loteByClave.get(
        claveLote(item.variante_id, item.fecha_ingreso),
      );
      if (lote?.presentacion_id === presentacionId) {
        acc.push({ item, index });
      }
      return acc;
    }, []);

  // Opciones del selector de lote: los disponibles más el que la fila ya usa,
  // aunque esté agotado o no pase el filtro, para que el select no quede vacío.
  const opcionesDeLote = (presentacion, loteActual) => {
    const opciones = lotesFiltrados(presentacion);
    if (
      loteActual &&
      !opciones.some(
        (l) =>
          claveLote(l.variante_id, l.fecha_ingreso) ===
          claveLote(loteActual.variante_id, loteActual.fecha_ingreso),
      )
    ) {
      return [loteActual, ...opciones];
    }
    return opciones;
  };

  // Filas visibles según el filtro. Las que ya tienen cantidad cargada nunca se
  // ocultan, para no esconder datos que igual se van a guardar.
  const filasVisibles = (presentacionId) => {
    const filtro = filtroDe(presentacionId);
    return filasDePresentacion(presentacionId).filter(({ item }) => {
      if ((parseFloat(item.cantidad) || 0) > 0) return true;
      const lote = loteByClave.get(
        claveLote(item.variante_id, item.fecha_ingreso),
      );
      return coincideFiltro(lote, filtro);
    });
  };

  // Devuelve los siguientes lotes por fecha que todavía no están en la lista,
  // para que al añadir filas se continúe con las fechas más recientes.
  const lotesDisponibles = (presentacion) => {
    const yaUsados = new Set(
      items.map((it) => claveLote(it.variante_id, it.fecha_ingreso)),
    );
    return lotesFiltrados(presentacion).filter(
      (lote) => !yaUsados.has(claveLote(lote.variante_id, lote.fecha_ingreso)),
    );
  };

  const togglePresentacion = (presentacion) => {
    const estaAbierta = presentacionesAbiertas.has(
      presentacion.presentacion_id,
    );

    setPresentacionesAbiertas((prev) => {
      const next = new Set(prev);
      if (estaAbierta) next.delete(presentacion.presentacion_id);
      else next.add(presentacion.presentacion_id);
      return next;
    });

    if (!estaAbierta) {
      const filasExistentes = filasDePresentacion(presentacion.presentacion_id);
      if (filasExistentes.length === 0) {
        const nuevas = lotesDisponibles(presentacion)
          .slice(0, FILAS_INICIALES_POR_PRESENTACION)
          .map(crearItemDesdeLote);
        if (nuevas.length > 0) onChangeItems([...items, ...nuevas]);
      }
    }
  };

  const addFila = (presentacion) => {
    const siguiente = lotesDisponibles(presentacion)[0];
    if (!siguiente) return;
    onChangeItems([...items, crearItemDesdeLote(siguiente)]);
  };

  const removeItem = (index) => {
    onChangeItems(items.filter((_, i) => i !== index));
    setFilaEditandoIndex(null);
  };

  const updateItem = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    onChangeItems(next);
  };

  // Al elegir otro lote se arrastra el peso por unidad con el que ingresó
  const cambiarLote = (index, lote) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      variante_id: lote.variante_id,
      fecha_ingreso: lote.fecha_ingreso,
      peso_unidad: lote.peso_unidad ?? next[index].peso_unidad,
    };
    onChangeItems(next);
  };

  const itemsConTotales = items.map((item, index) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const pesoUnidad = parseFloat(item.peso_unidad) || 0;
    return { ...item, numero_item: index + 1, total_kg: cantidad * pesoUnidad };
  });

  const sumaCantidad = itemsConTotales.reduce(
    (t, i) => t + (parseFloat(i.cantidad) || 0),
    0,
  );
  const sumaTotalKg = itemsConTotales.reduce((t, i) => t + i.total_kg, 0);

  const setFiltro = (presentacionId, campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [presentacionId]: { ...filtroDe(presentacionId), [campo]: valor },
    }));
  };

  return (
    <div className="mb-4 border border-line bg-surface p-3">
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-line pb-1.5">
        <h2 className="label-col">Lista de salida</h2>
        <div className="text-sm text-gray-600">
          Suma cantidad: <span className="font-semibold">{sumaCantidad}</span> |{" "}
          Suma total kg:{" "}
          <span className="font-semibold">{sumaTotalKg.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}

      {!especieId ? (
        <p className="text-sm text-gray-500 py-4">
          Primero seleccione una especie para ver sus presentaciones.
        </p>
      ) : presentaciones.length === 0 ? (
        <Alert variant="warning">
          Esta especie no tiene existencias registradas para despachar.
        </Alert>
      ) : (
        <div className="space-y-3">
          {presentaciones.map((presentacion) => {
            const abierta = presentacionesAbiertas.has(
              presentacion.presentacion_id,
            );
            const filas = filasDePresentacion(presentacion.presentacion_id);
            const visibles = filasVisibles(presentacion.presentacion_id);
            const ocultasPorFiltro = filas.length - visibles.length;
            const filtro = filtroDe(presentacion.presentacion_id);
            const filtroActivo = hayFiltroActivo(filtro);
            // Ambos numeros salen del mismo conjunto filtrado, para que la
            // cabecera nunca mezcle un conteo filtrado con otro sin filtrar.
            const disponibles = lotesFiltrados(presentacion);
            const totalCajasDisponibles = disponibles.reduce(
              (t, l) => t + l.stock_cajas,
              0,
            );
            const totalLotesConStock = presentacion.lotes.filter(
              (l) => l.stock_cajas > 0,
            ).length;

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
                    {disponibles.length} lote
                    {disponibles.length === 1 ? "" : "s"}
                    {filtroActivo && ` de ${totalLotesConStock}`} ·{" "}
                    {totalCajasDisponibles} cajas disponibles
                    {filas.length > 0 && ` · ${filas.length} en la lista`}
                  </span>
                </button>

                {abierta && (
                  <div>
                    {/* Filtros por calidad y calibre */}
                    <div className="flex flex-wrap items-end gap-4 px-4 py-3 bg-surface border-b border-line">
                      <div className="min-w-[180px]">
                        <Select
                          label="Calidad"
                          value={filtro.calidad_id}
                          onChange={(e) =>
                            setFiltro(
                              presentacion.presentacion_id,
                              "calidad_id",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Todas</option>
                          {presentacion.calidades.map(([id, nombre]) => (
                            <option key={id} value={id}>
                              {nombre}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="min-w-[180px]">
                        <Select
                          label="Calibre"
                          value={filtro.calibre_id}
                          onChange={(e) =>
                            setFiltro(
                              presentacion.presentacion_id,
                              "calibre_id",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Todos</option>
                          {presentacion.calibres.map(([id, nombre]) => (
                            <option key={id} value={id}>
                              {nombre}
                            </option>
                          ))}
                        </Select>
                      </div>
                      {(filtro.calidad_id || filtro.calibre_id) && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            setFiltros((prev) => ({
                              ...prev,
                              [presentacion.presentacion_id]: {
                                calidad_id: "",
                                calibre_id: "",
                              },
                            }))
                          }
                        >
                          Limpiar filtros
                        </Button>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">
                        {ocultasPorFiltro > 0
                          ? `${ocultasPorFiltro} fila${ocultasPorFiltro === 1 ? "" : "s"} oculta${ocultasPorFiltro === 1 ? "" : "s"} por el filtro`
                          : `${disponibles.length} lote${disponibles.length === 1 ? "" : "s"} disponible${disponibles.length === 1 ? "" : "s"}`}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <TableModular className="table--bordered text-left">
                        <TableHeader>
                          <tr>
                            <TableHead className="w-12">Item</TableHead>
                            <TableHead>Variante</TableHead>
                            <TableHead className="w-40">Fecha Ingreso</TableHead>
                            <TableHead className="w-28">Disponible</TableHead>
                            <TableHead>Cód. Trazabilidad</TableHead>
                            <TableHead className="w-24">Cantidad</TableHead>
                            <TableHead className="w-28">Peso Unidad</TableHead>
                            <TableHead className="w-28">Total Kg</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </tr>
                        </TableHeader>
                        <tbody>
                          {visibles.length === 0 ? (
                            <tr>
                              <td
                                colSpan={9}
                                className="p-4 text-center text-sm text-gray-500 border"
                              >
                                {filas.length === 0
                                  ? 'Sin filas. Use "Añadir lote" para agregar.'
                                  : "Ninguna fila coincide con el filtro."}
                              </td>
                            </tr>
                          ) : (
                            visibles.map(({ item, index }) => {
                              const lote = loteByClave.get(
                                claveLote(item.variante_id, item.fecha_ingreso),
                              );
                              const cantidad = parseFloat(item.cantidad) || 0;
                              const pesoUnidad =
                                parseFloat(item.peso_unidad) || 0;
                              const excede =
                                lote != null && cantidad > lote.stock_cajas;

                              return (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 transition-colors"
                                >
                                  <td className="p-2 border text-center font-semibold">
                                    {index + 1}
                                  </td>
                                  <td className="p-1 border">
                                    {filaEditandoIndex === index ? (
                                      <Select
                                        autoFocus
                                        value={claveLote(
                                          item.variante_id,
                                          item.fecha_ingreso,
                                        )}
                                        onChange={(e) => {
                                          const elegido =
                                            presentacion.lotes.find(
                                              (l) =>
                                                claveLote(
                                                  l.variante_id,
                                                  l.fecha_ingreso,
                                                ) === e.target.value,
                                            );
                                          if (elegido)
                                            cambiarLote(index, elegido);
                                          setFilaEditandoIndex(null);
                                        }}
                                        onBlur={() =>
                                          setFilaEditandoIndex(null)
                                        }
                                        className="border-none bg-transparent"
                                      >
                                        {opcionesDeLote(presentacion, lote).map(
                                          (l) => (
                                            <option
                                              key={claveLote(
                                                l.variante_id,
                                                l.fecha_ingreso,
                                              )}
                                              value={claveLote(
                                                l.variante_id,
                                                l.fecha_ingreso,
                                              )}
                                            >
                                              {l.codigo_completo} —{" "}
                                              {l.fecha_ingreso} (
                                              {l.stock_cajas} cajas)
                                            </option>
                                          ),
                                        )}
                                      </Select>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFilaEditandoIndex(index)
                                        }
                                        className="w-full text-left px-1 py-1 hover:bg-blue-50 flex items-center gap-1 group"
                                        title="Cambiar lote"
                                      >
                                        <span className="truncate">
                                          {lote?.codigo_completo ??
                                            "Seleccione..."}
                                        </span>
                                        <Edit2
                                          size={12}
                                          className="opacity-0 group-hover:opacity-60 shrink-0"
                                        />
                                      </button>
                                    )}
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      type="date"
                                      className="w-full p-1 border-none bg-transparent focus:ring-0"
                                      value={item.fecha_ingreso ?? ""}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "fecha_ingreso",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="p-2 border text-center text-xs">
                                    {lote ? (
                                      <span
                                        className={
                                          excede
                                            ? "font-medium text-crit"
                                            : "text-ink-muted"
                                        }
                                      >
                                        {lote.stock_cajas} cajas
                                        <br />
                                        {lote.stock_kg.toFixed(2)} kg
                                      </span>
                                    ) : (
                                      <Badge variant="crit">Sin stock</Badge>
                                    )}
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      type="text"
                                      className="w-full p-1 border-none bg-transparent focus:ring-0"
                                      value={item.codigo_trazabilidad ?? ""}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "codigo_trazabilidad",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      type="number"
                                      min="0"
                                      className={`w-full p-1 border-none bg-transparent focus:ring-0 ${
                                        excede ? "text-red-600 font-semibold" : ""
                                      }`}
                                      value={item.cantidad}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "cantidad",
                                          e.target.value,
                                        )
                                      }
                                      title={
                                        excede
                                          ? "La cantidad supera el stock del lote"
                                          : undefined
                                      }
                                    />
                                  </td>
                                  <td className="p-1 border">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="w-full p-1 border-none bg-transparent focus:ring-0"
                                      value={item.peso_unidad}
                                      onChange={(e) =>
                                        updateItem(
                                          index,
                                          "peso_unidad",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </td>
                                  <td className="p-2 border font-semibold text-blue-600 bg-blue-50/30">
                                    {(cantidad * pesoUnidad).toFixed(2)}
                                  </td>
                                  <td className="p-2 border text-center">
                                    <button
                                      type="button"
                                      onClick={() => removeItem(index)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </TableModular>

                      <div className="p-2 border-t border-line">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          icon={<Plus size={14} />}
                          iconPosition="left"
                          onClick={() => addFila(presentacion)}
                          disabled={lotesDisponibles(presentacion).length === 0}
                        >
                          Añadir lote
                        </Button>
                        {lotesDisponibles(presentacion).length === 0 && (
                          <span className="ml-3 text-xs text-gray-500">
                            No quedan lotes sin agregar en esta presentación
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-4 bg-gray-50 border border-line px-4 py-3 font-bold text-sm">
          <span>TOTALES:</span>
          <span className="text-blue-800">{sumaCantidad} cajas</span>
          <span className="text-blue-800">{sumaTotalKg.toFixed(2)} kg</span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm font-medium text-gray-700">
          Motivo de Salida:
        </span>
        <div className="flex gap-2">
          {motivos.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMotivoSalida(m.id)}
              className={`border px-2.5 py-1 text-xs font-medium tracking-[0.06em] uppercase transition-colors ${
                motivoSalida === m.id
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
