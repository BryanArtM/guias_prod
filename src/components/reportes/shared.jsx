// Piezas comunes a los reportes: formato de numeros y fechas, contenedores y
// graficos simples en SVG (sin dependencias externas).
import { invoke } from "@tauri-apps/api/core";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export const UNIDAD_KG = "kg";
export const UNIDAD_CAJAS = "cajas";

export function formatearNumero(valor, decimales = 2) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("es-PE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

export function formatearEntero(valor) {
  return Number(valor || 0).toLocaleString("es-PE");
}

// Muestra un guion en vez de un cero, para que la grilla no se sature de ceros
export function formatearCelda(valor, unidad) {
  const numero = Number(valor || 0);
  if (numero === 0) return "-";
  return unidad === UNIDAD_CAJAS
    ? formatearEntero(numero)
    : formatearNumero(numero);
}

export function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function diasDesde(fechaIso) {
  if (!fechaIso) return null;
  const inicio = new Date(`${fechaIso}T00:00:00`);
  if (Number.isNaN(inicio.getTime())) return null;
  return Math.floor((new Date() - inicio) / 86400000);
}

export function hoyIso() {
  return new Date().toISOString().split("T")[0];
}

export function haceDiasIso(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha.toISOString().split("T")[0];
}

/**
 * Guarda un CSV en la carpeta de descargas y lo muestra en el explorador.
 * No se usa un enlace de descarga porque el webview de Tauri las bloquea:
 * el archivo lo escribe el backend. Devuelve la ruta donde quedó guardado.
 */
export async function descargarCSV(nombre, encabezados, filas) {
  const csv = [
    encabezados.join(","),
    ...filas.map((fila) =>
      fila
        .map((celda) =>
          typeof celda === "string" && /[",\n]/.test(celda)
            ? `"${celda.replace(/"/g, '""')}"`
            : celda,
        )
        .join(","),
    ),
  ].join("\n");

  const ruta = await invoke("guardar_archivo_csv", {
    nombre: `${nombre}_${hoyIso()}.csv`,
    contenido: csv,
  });

  // Si el explorador no se puede abrir, el archivo igual quedó guardado
  try {
    await revealItemInDir(ruta);
  } catch {
    /* sin acción */
  }

  return ruta;
}

/** Encabezado de cada reporte: titulo, descripcion y acciones a la derecha */
export function EncabezadoReporte({ titulo, descripcion, acciones }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4 mb-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          {titulo}
        </h2>
        {descripcion && (
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex gap-2">{acciones}</div>}
    </div>
  );
}

/** Tarjeta de indicador para las cifras principales de cada reporte */
export function Indicador({ etiqueta, valor, detalle, tono = "neutro" }) {
  const tonos = {
    neutro: "text-gray-900",
    positivo: "text-blue-900",
    alerta: "text-amber-700",
    negativo: "text-red-700",
  };
  return (
    <div className="bg-surface border border-line px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {etiqueta}
      </p>
      <p className={`text-2xl font-semibold mt-1 tabular-nums ${tonos[tono]}`}>
        {valor}
      </p>
      {detalle && <p className="text-xs text-gray-500 mt-0.5">{detalle}</p>}
    </div>
  );
}

export function PanelVacio({ mensaje }) {
  return (
    <div className="text-center py-16 text-gray-500 border border-dashed border-line">
      {mensaje}
    </div>
  );
}

export function Cargando() {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900" />
    </div>
  );
}

/**
 * Barras horizontales en SVG. Se usa para distribuciones donde importa
 * comparar magnitudes entre pocas categorias.
 */
export function BarrasHorizontales({ datos, formatoValor, altura = 28 }) {
  const maximo = Math.max(...datos.map((d) => d.valor), 0);
  if (maximo <= 0) {
    return <PanelVacio mensaje="Sin datos para graficar" />;
  }

  const anchoEtiqueta = 150;
  const anchoValor = 110;
  const anchoBarra = 520;
  const ancho = anchoEtiqueta + anchoBarra + anchoValor;
  const alto = datos.length * altura + 10;

  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      className="w-full"
      style={{ maxHeight: alto }}
      role="img"
    >
      {datos.map((dato, indice) => {
        const y = indice * altura;
        const largo = (dato.valor / maximo) * anchoBarra;
        return (
          <g key={dato.etiqueta}>
            <text
              x={anchoEtiqueta - 10}
              y={y + altura / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-gray-700"
              style={{ fontSize: 12 }}
            >
              {dato.etiqueta}
            </text>
            <rect
              x={anchoEtiqueta}
              y={y + 5}
              width={anchoBarra}
              height={altura - 12}
              className="fill-gray-100"
              rx="2"
            />
            <rect
              x={anchoEtiqueta}
              y={y + 5}
              width={Math.max(largo, dato.valor > 0 ? 2 : 0)}
              height={altura - 12}
              fill={dato.color || "#1e3a8a"}
              rx="2"
            />
            <text
              x={anchoEtiqueta + anchoBarra + 10}
              y={y + altura / 2}
              dominantBaseline="middle"
              className="fill-gray-900 tabular-nums"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              {formatoValor ? formatoValor(dato.valor) : dato.valor}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Curva de evolución de un saldo en el tiempo. Marca el cero para que se vea
 * con claridad si el saldo quedó en negativo.
 */
export function GraficoSaldo({ puntos, formatoValor }) {
  if (puntos.length < 2) {
    return (
      <PanelVacio mensaje="Se necesitan al menos dos movimientos para graficar la evolución" />
    );
  }

  const ancho = 900;
  const alto = 250;
  const margen = { arriba: 16, derecha: 24, abajo: 62, izquierda: 74 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.arriba - margen.abajo;

  const valores = puntos.map((p) => p.valor);
  const maximo = Math.max(...valores, 0);
  const minimo = Math.min(...valores, 0);
  const rango = maximo - minimo || 1;

  const x = (i) => margen.izquierda + (i / (puntos.length - 1)) * anchoUtil;
  const y = (v) => margen.arriba + altoUtil - ((v - minimo) / rango) * altoUtil;

  const linea = puntos.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.valor)}`).join(" ");
  const area = `${linea} L ${x(puntos.length - 1)} ${y(minimo)} L ${x(0)} ${y(minimo)} Z`;

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full" role="img">
      {/* Guias horizontales */}
      {[0, 0.25, 0.5, 0.75, 1].map((fraccion) => {
        const valor = minimo + fraccion * rango;
        return (
          <g key={fraccion}>
            <line
              x1={margen.izquierda}
              x2={ancho - margen.derecha}
              y1={y(valor)}
              y2={y(valor)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={margen.izquierda - 8}
              y={y(valor)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-gray-500 tabular-nums"
              style={{ fontSize: 11 }}
            >
              {formatoValor ? formatoValor(valor) : Math.round(valor)}
            </text>
          </g>
        );
      })}

      {minimo < 0 && (
        <line
          x1={margen.izquierda}
          x2={ancho - margen.derecha}
          y1={y(0)}
          y2={y(0)}
          stroke="#dc2626"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
      )}

      <path d={area} fill="#1e3a8a" fillOpacity="0.08" />
      <path d={linea} fill="none" stroke="#1e3a8a" strokeWidth="2" />

      {puntos.map((p, i) => (
        <circle
          key={`${p.etiqueta}-${i}`}
          cx={x(i)}
          cy={y(p.valor)}
          r="3"
          fill="#1e3a8a"
        >
          <title>{`${p.etiqueta}: ${formatoValor ? formatoValor(p.valor) : p.valor}`}</title>
        </circle>
      ))}

      {/* Eje X: se reparten las marcas para poder seguir la evolucion, sin
          amontonarlas cuando hay muchos movimientos. Se rotan para que quepan. */}
      {(() => {
        const maximoMarcas = 12;
        const paso = Math.max(1, Math.ceil(puntos.length / maximoMarcas));
        const indices = puntos
          .map((_, i) => i)
          .filter((i) => i % paso === 0 || i === puntos.length - 1);

        return indices.map((i) => (
          <g key={`marca-${i}`}>
            <line
              x1={x(i)}
              x2={x(i)}
              y1={margen.arriba + altoUtil}
              y2={margen.arriba + altoUtil + 4}
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <text
              x={x(i)}
              y={margen.arriba + altoUtil + 8}
              textAnchor="end"
              transform={`rotate(-45 ${x(i)} ${margen.arriba + altoUtil + 8})`}
              className="fill-gray-500"
              style={{ fontSize: 10 }}
            >
              {puntos[i].etiqueta}
            </text>
          </g>
        ));
      })()}
    </svg>
  );
}
