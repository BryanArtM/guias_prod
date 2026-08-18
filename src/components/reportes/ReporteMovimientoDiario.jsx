import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common";
import { Download } from "lucide-react";
import { obtenerMovimientos, obtenerMateriaPrima } from "@/services";
import {
  BarrasHorizontales,
  Cargando,
  EncabezadoReporte,
  Indicador,
  PanelVacio,
  UNIDAD_CAJAS,
  UNIDAD_KG,
  descargarCSV,
  formatearCelda,
  formatearFecha,
  formatearNumero,
} from "./shared";

// Matriz fecha x variante, agrupada por presentacion, con las tres secciones
// del control de produccion: lo que se produjo, lo que salio y el neto.
export default function ReporteMovimientoDiario({ desde, hasta, especieId }) {
  const [movimientos, setMovimientos] = useState([]);
  const [materiaPrima, setMateriaPrima] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [unidad, setUnidad] = useState(UNIDAD_KG);
  const [avisoExport, setAvisoExport] = useState(null);

  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        // Se piden los movimientos sin fecha inicial para poder calcular el
        // saldo anterior al periodo; el corte se aplica al agrupar.
        const [movs, mp] = await Promise.all([
          obtenerMovimientos({ hasta, especieId }),
          obtenerMateriaPrima({ desde, hasta, especieId }),
        ]);
        if (!vigente) return;
        setMovimientos(movs || []);
        setMateriaPrima(mp || []);
      } catch (e) {
        if (vigente) setError(e.message || String(e));
      } finally {
        if (vigente) setCargando(false);
      }
    };
    cargar();
    return () => {
      vigente = false;
    };
  }, [desde, hasta, especieId]);

  const campo = unidad === UNIDAD_CAJAS ? "cajas" : "kg";

  const modelo = useMemo(() => {
    const enPeriodo = movimientos.filter((m) => !desde || m.fecha >= desde);
    const previos = movimientos.filter((m) => desde && m.fecha < desde);

    // Columnas: una por variante. El encabezado se arma en tres niveles
    // (presentacion / calibre / calidad) para no repetir texto, igual que en
    // el control manual donde el calibre encabeza y la calidad va debajo.
    const columnas = [
      ...new Map(
        movimientos.map((m) => [
          m.variante_id,
          {
            variante_id: m.variante_id,
            presentacion: m.presentacion_nombre,
            calibre: m.calibre || "Sin calibre",
            calidad: m.calidad || "Sin calidad",
            ensunchado: m.codigo_completo.includes(" Z "),
          },
        ]),
      ).values(),
    ].sort(
      (a, b) =>
        a.presentacion.localeCompare(b.presentacion, "es") ||
        a.calibre.localeCompare(b.calibre, "es", { numeric: true }) ||
        a.calidad.localeCompare(b.calidad, "es") ||
        Number(a.ensunchado) - Number(b.ensunchado),
    );

    const grupos = [];
    for (const columna of columnas) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.presentacion === columna.presentacion) {
        ultimo.columnas.push(columna);
      } else {
        grupos.push({ presentacion: columna.presentacion, columnas: [columna] });
      }
    }

    // Segundo nivel: el calibre, compartido por todas las calidades que lo
    // usan. En la fila de abajo queda solo la calidad, que es lo que distingue
    // una columna de otra.
    for (const grupo of grupos) {
      const subgrupos = [];
      for (const columna of grupo.columnas) {
        const ultimo = subgrupos[subgrupos.length - 1];
        if (ultimo && ultimo.etiqueta === columna.calibre) {
          ultimo.columnas.push(columna);
        } else {
          subgrupos.push({ etiqueta: columna.calibre, columnas: [columna] });
        }
      }
      grupo.subgrupos = subgrupos;
    }

    const fechas = [...new Set(enPeriodo.map((m) => m.fecha))].sort();

    const clave = (fecha, varianteId) => `${fecha}|${varianteId}`;
    const produccion = new Map();
    const salidas = new Map();
    for (const m of enPeriodo) {
      const destino = m.tipo === "INGRESO" ? produccion : salidas;
      const k = clave(m.fecha, m.variante_id);
      destino.set(k, (destino.get(k) ?? 0) + m[campo]);
    }

    // Saldo con el que arranca el periodo
    const apertura = new Map();
    for (const m of previos) {
      const signo = m.tipo === "INGRESO" ? 1 : -1;
      apertura.set(
        m.variante_id,
        (apertura.get(m.variante_id) ?? 0) + signo * m[campo],
      );
    }

    const materiaPorFecha = new Map();
    for (const dia of materiaPrima) {
      materiaPorFecha.set(
        dia.fecha,
        (materiaPorFecha.get(dia.fecha) ?? 0) + dia.kg_recepcion,
      );
    }

    return { columnas, grupos, fechas, produccion, salidas, apertura, materiaPorFecha };
  }, [movimientos, materiaPrima, desde, campo]);

  const totalesDe = (mapa) => {
    const totales = new Map();
    for (const columna of modelo.columnas) {
      let suma = 0;
      for (const fecha of modelo.fechas) {
        suma += mapa.get(`${fecha}|${columna.variante_id}`) ?? 0;
      }
      totales.set(columna.variante_id, suma);
    }
    return totales;
  };

  const totalesProduccion = useMemo(
    () => totalesDe(modelo.produccion),
    [modelo],
  );
  const totalesSalidas = useMemo(() => totalesDe(modelo.salidas), [modelo]);

  const sumaTotal = (totales) =>
    [...totales.values()].reduce((t, v) => t + v, 0);

  const totalMateriaPrima = useMemo(
    () => materiaPrima.reduce((t, d) => t + d.kg_recepcion, 0),
    [materiaPrima],
  );

  // El rendimiento siempre se mide en kg contra kg, sin importar la unidad
  // elegida para la grilla: comparar cajas contra kg no significaria nada.
  const producidoKg = useMemo(
    () =>
      movimientos
        .filter((m) => m.tipo === "INGRESO" && (!desde || m.fecha >= desde))
        .reduce((total, m) => total + m.kg, 0),
    [movimientos, desde],
  );

  const exportar = async () => {
    const encabezados = [
      "Seccion",
      "Fecha",
      "Presentacion",
      "Calibre",
      "Calidad",
      "Ensunchado",
      unidad === UNIDAD_CAJAS ? "Cajas" : "Kg",
    ];
    const filas = [];
    const agregar = (seccion, mapa) => {
      for (const fecha of modelo.fechas) {
        for (const columna of modelo.columnas) {
          const valor = mapa.get(`${fecha}|${columna.variante_id}`) ?? 0;
          if (valor !== 0) {
            filas.push([
              seccion,
              fecha,
              columna.presentacion,
              columna.calibre,
              columna.calidad,
              columna.ensunchado ? "Si" : "No",
              valor,
            ]);
          }
        }
      }
    };
    agregar("PRODUCCION", modelo.produccion);
    agregar("SALIDAS", modelo.salidas);
    try {
      const ruta = await descargarCSV("movimiento_diario", encabezados, filas);
      setAvisoExport(`Archivo guardado en ${ruta}`);
    } catch (e) {
      setAvisoExport(`No se pudo exportar: ${e.message || e}`);
    }
  };

  if (cargando) return <Cargando />;
  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (modelo.columnas.length === 0) {
    return <PanelVacio mensaje="No hay movimientos en el período seleccionado" />;
  }

  const anchoEtiquetas = 2; // columna de fecha + materia prima

  const renderTabla = (titulo, mapa, opciones = {}) => {
    const { conMateriaPrima = false, conApertura = false, calcular } = opciones;

    const valorCelda = (fecha, varianteId) =>
      calcular
        ? calcular(fecha, varianteId)
        : (mapa.get(`${fecha}|${varianteId}`) ?? 0);

    const totalesColumna = modelo.columnas.map((columna) =>
      modelo.fechas.reduce(
        (suma, fecha) => suma + valorCelda(fecha, columna.variante_id),
        0,
      ),
    );

    return (
      <section className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 bg-gray-100 border border-gray-300 border-b-0 px-3 py-2">
          {titulo}
        </h3>
        <div className="overflow-x-auto border border-gray-300">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th
                  rowSpan={3}
                  className="border border-gray-300 bg-gray-50 px-2 py-2 text-left font-semibold text-gray-700 sticky left-0 z-10"
                >
                  Fecha
                </th>
                {conMateriaPrima && (
                  <th
                    rowSpan={3}
                    className="border border-gray-300 bg-gray-50 px-2 py-2 text-right font-semibold text-gray-700 whitespace-nowrap"
                  >
                    Materia Prima
                  </th>
                )}
                {modelo.grupos.map((grupo) => (
                  <th
                    key={grupo.presentacion}
                    colSpan={grupo.columnas.length}
                    className="border border-gray-300 bg-blue-900 text-white px-2 py-1.5 text-center font-semibold uppercase tracking-wide"
                  >
                    {grupo.presentacion}
                  </th>
                ))}
              </tr>
              {/* Calibre, compartido por todas las calidades que lo usan */}
              <tr>
                {modelo.grupos.flatMap((grupo) =>
                  grupo.subgrupos.map((sub) => (
                    <th
                      key={`${grupo.presentacion}-${sub.etiqueta}`}
                      colSpan={sub.columnas.length}
                      className="border border-gray-300 bg-gray-100 px-2 py-1.5 text-center font-medium text-gray-700 whitespace-nowrap"
                    >
                      {sub.etiqueta}
                    </th>
                  )),
                )}
              </tr>
              {/* Calidad: lo unico que distingue una columna de otra */}
              <tr>
                {modelo.columnas.map((columna) => (
                  <th
                    key={columna.variante_id}
                    className="border border-gray-300 bg-gray-50 px-2 py-1 text-center text-xs font-medium text-gray-600 whitespace-nowrap"
                    title={`${columna.calibre} · ${columna.calidad}${
                      columna.ensunchado ? " · ensunchado" : ""
                    }`}
                  >
                    {columna.calidad}
                    {columna.ensunchado && (
                      <span className="ml-1 text-blue-800 font-bold">Z</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conApertura && (
                <tr className="bg-gray-50 font-medium">
                  <td className="border border-gray-300 px-2 py-1.5 sticky left-0 bg-gray-50 z-10">
                    Saldo anterior
                  </td>
                  {conMateriaPrima && (
                    <td className="border border-gray-300 px-2 py-1.5 text-right text-gray-400">
                      -
                    </td>
                  )}
                  {modelo.columnas.map((columna) => (
                    <td
                      key={columna.variante_id}
                      className="border border-gray-300 px-2 py-1.5 text-right tabular-nums"
                    >
                      {formatearCelda(
                        modelo.apertura.get(columna.variante_id) ?? 0,
                        unidad,
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {modelo.fechas.map((fecha) => (
                <tr key={fecha} className="hover:bg-blue-50/40">
                  <td className="border border-gray-300 px-2 py-1.5 whitespace-nowrap sticky left-0 bg-white z-10">
                    {formatearFecha(fecha)}
                  </td>
                  {conMateriaPrima && (
                    <td className="border border-gray-300 px-2 py-1.5 text-right tabular-nums font-medium text-gray-700">
                      {formatearCelda(
                        modelo.materiaPorFecha.get(fecha) ?? 0,
                        UNIDAD_KG,
                      )}
                    </td>
                  )}
                  {modelo.columnas.map((columna) => {
                    const valor = valorCelda(fecha, columna.variante_id);
                    return (
                      <td
                        key={columna.variante_id}
                        className={`border border-gray-300 px-2 py-1.5 text-right tabular-nums ${
                          valor < 0 ? "text-red-700 font-medium" : ""
                        }`}
                      >
                        {formatearCelda(valor, unidad)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="border border-gray-300 px-2 py-2 sticky left-0 bg-gray-100 z-10">
                  TOTALES
                </td>
                {conMateriaPrima && (
                  <td className="border border-gray-300 px-2 py-2 text-right tabular-nums">
                    {formatearNumero(totalMateriaPrima)}
                  </td>
                )}
                {totalesColumna.map((total, indice) => (
                  <td
                    key={modelo.columnas[indice].variante_id}
                    className={`border border-gray-300 px-2 py-2 text-right tabular-nums ${
                      total < 0 ? "text-red-700" : ""
                    }`}
                  >
                    {formatearCelda(total, unidad)}
                  </td>
                ))}
              </tr>
              {/* Subtotal por presentacion, como en el control manual */}
              <tr className="bg-blue-900 text-white font-semibold">
                <td
                  colSpan={conMateriaPrima ? anchoEtiquetas : 1}
                  className="border border-gray-300 px-2 py-2 sticky left-0 bg-blue-900 z-10"
                >
                  Subtotal por presentación
                </td>
                {modelo.grupos.map((grupo) => {
                  const subtotal = grupo.columnas.reduce((suma, columna) => {
                    const indice = modelo.columnas.findIndex(
                      (c) => c.variante_id === columna.variante_id,
                    );
                    return suma + totalesColumna[indice];
                  }, 0);
                  return (
                    <td
                      key={grupo.presentacion}
                      colSpan={grupo.columnas.length}
                      className="border border-gray-300 px-2 py-2 text-right tabular-nums"
                    >
                      {formatearCelda(subtotal, unidad)}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    );
  };

  const totalProduccion = sumaTotal(totalesProduccion);
  const totalSalidas = sumaTotal(totalesSalidas);
  const rendimiento =
    totalMateriaPrima > 0 ? (producidoKg / totalMateriaPrima) * 100 : null;

  return (
    <div>
      <EncabezadoReporte
        titulo="Movimiento diario de producción"
        descripcion="Producción, salidas y saldo por variante para cada día del período. Los ingresos se ubican en la fecha del lote; las salidas, en la fecha en que salió la mercadería."
        acciones={
          <>
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              {[UNIDAD_KG, UNIDAD_CAJAS].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnidad(u)}
                  className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                    unidad === u
                      ? "bg-blue-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={exportar}
              icon={<Download className="w-4 h-4" />}
              iconPosition="left"
            >
              CSV
            </Button>
          </>
        }
      />

      {avisoExport && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 flex items-start justify-between gap-4">
          <span className="break-all">{avisoExport}</span>
          <button
            type="button"
            onClick={() => setAvisoExport(null)}
            className="text-blue-700 hover:text-blue-900 shrink-0"
          >
            Cerrar
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Indicador
          etiqueta="Materia prima"
          valor={`${formatearNumero(totalMateriaPrima)} kg`}
          detalle={`${materiaPrima.length} días con recepción`}
        />
        <Indicador
          etiqueta="Producido"
          valor={`${formatearCelda(totalProduccion, unidad)} ${unidad}`}
          tono="positivo"
        />
        <Indicador
          etiqueta="Despachado"
          valor={`${formatearCelda(totalSalidas, unidad)} ${unidad}`}
        />
        <Indicador
          etiqueta="Rendimiento"
          valor={rendimiento != null ? `${formatearNumero(rendimiento)} %` : "n/d"}
          detalle="Producido sobre materia prima"
          tono={rendimiento != null && rendimiento < 25 ? "alerta" : "neutro"}
        />
      </div>

      {renderTabla("Producción", modelo.produccion, {
        conMateriaPrima: true,
        conApertura: false,
      })}
      {renderTabla("Salidas", modelo.salidas)}
      {renderTabla("Neto del período", null, {
        conApertura: true,
        calcular: (fecha, varianteId) =>
          (modelo.produccion.get(`${fecha}|${varianteId}`) ?? 0) -
          (modelo.salidas.get(`${fecha}|${varianteId}`) ?? 0),
      })}

      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Producción acumulada por presentación
        </h3>
        <BarrasHorizontales
          datos={modelo.grupos.map((grupo) => ({
            etiqueta: grupo.presentacion,
            valor: grupo.columnas.reduce((suma, columna) => {
              const indice = modelo.columnas.findIndex(
                (c) => c.variante_id === columna.variante_id,
              );
              return (
                suma +
                modelo.fechas.reduce(
                  (s, fecha) =>
                    s +
                    (modelo.produccion.get(`${fecha}|${columna.variante_id}`) ??
                      0),
                  0,
                )
              );
            }, 0),
          }))}
          formatoValor={(v) => `${formatearCelda(v, unidad)} ${unidad}`}
        />
      </section>
    </div>
  );
}
