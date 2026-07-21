import { partesService } from "@/services";
import PrintButton from "@/components/common/PrintButton";
// ─── Helpers de formato ──────────────────────────────────────────────────────
const fmtNum = (n, dec = 1) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(Number(n) || 0);

const fmtEntero = (n) => fmtNum(n, 0);

// ─── Formateo de fecha ───────────────────────────────────────────────────────
function fmtFecha(fechaStr) {
  if (!fechaStr) return "-";
  const s = String(fechaStr).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return s;
}

// ─── Generador de HTML para impresión ────────────────────────────────────────
function generarHtmlImpresion(parte) {
  const {
    codigo,
    revision,
    cliente,
    fecha,
    turno,
    codigo_trazabilidad,
    especie_nombre,
    observaciones,
    motivo_ingreso_codigo, // "produccion" | "reempaque" | "despacho" | "otros"
    productos = [],
  } = parte;

  // Por defecto, si no viene informado, se marca "PRODUCCIÓN" (comportamiento del formulario original)
  const motivoActivo = (motivo_ingreso_codigo || "PRODUCCION").toUpperCase();
  const marcaOn = (v) => (motivoActivo === v.toUpperCase() ? "X" : "");
  const sumaCajas = (p) =>
    (parseInt(p.cajas_carro_1) || 0) +
    (parseInt(p.cajas_carro_2) || 0) +
    (parseInt(p.cajas_carro_3) || 0) +
    (parseInt(p.cajas_carro_4) || 0);

  const totales = productos.reduce(
    (acc, p) => {
      const cajas = sumaCajas(p);
      const totalKgFila = cajas * (parseFloat(p.peso_unidad) || 0);
      acc.cajas += cajas;
      acc.pesoNeto += parseFloat(p.peso_total_neto_kg) || 0;
      return acc;
    },
    { cajas: 0, pesoNeto: 0 },
  );

  const ROW_H = 22; // px, altura fija de cada fila (debe coincidir con la columna F.P. lateral)
  const HEAD_H = 32; // px, altura fija del encabezado de la tabla

  const lineasObservaciones = (observaciones || "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);

  const filasProductos = productos
    .map((p, i) => {
      const cajas = sumaCajas(p);
      const totalKgFila = cajas * (parseFloat(p.peso_unidad) || 0);
      const nombreProducto =
        p.nombre_producto || p.codigo_completo || `Variante #${p.variante_id}`;
      const trazabilidad = p.codigo_trazabilidad || codigo_trazabilidad || "-";

      return `
        <tr style="height:${ROW_H}px">
          <td class="celda-item">${i + 1}</td>
          <td class="celda-desc">
            <div class="desc-linea1">
              ${nombreProducto} 
              <span class="desc-linea2">
                F.P.: ${fmtFecha(fecha) || "-"}
              </span>
            </div>
            
          </td>
          <td class="celda-traz">
            <div class="traz-linea1">${trazabilidad}</div>
          </td>
          <td class="celda-num">${fmtEntero(cajas)}</td>
          <td class="celda-num">${fmtNum(p.peso_unidad, 1)}</td>
          <td class="celda-total">${fmtNum(totalKgFila, 1)}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Control de Ingreso a Cámara N° ${codigo || ""}</title>
  <style>
    * { margin: 0; 
        padding: 0; 
        box-sizing: border-box; 
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      color: #000;
      padding: 10mm 12mm;
      background: #fff;
    }

    /* ── ENCABEZADO ── */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .header-logo { min-width: 220px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .logo-nombre {
      font-family: "Century", "Century Schoolbook", serif;
      font-size: 13pt; font-weight: bold; color: #1a4fa0;
      border-bottom: 1.5px solid #1a4fa0; display: inline-block; padding-bottom: 1px;
    }
    .header-img {
      display: flex;
      align-items: center;
      width: 120px;
      height: 120px;
      object-fit: contain;
      margin-right: 8px;
    }
    .header-address {
      font-size: 7pt;
      color: #1a4fa0;
      margin-top: 3px;
      line-height: 1.55;
      font-style: italic;
    }
    .header-title {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .title-box {
      background: #1a4fa0;
      color: #fff;
      font-weight: bold;
      font-size: 13pt;
      padding: 8px 22px;
      text-align: center;
      line-height: 1.3;
      width: 260px;
    }
    .header-numero {
      min-width: 160px;
      text-align: right;
      padding-top: 6px;
    }
    .numero-text {
      color: #a30000;
      font-weight: bold;
      font-size: 17pt;
      font-family: "Times New Roman", Times, serif;
    }

    /* ── DATOS GENERALES ── */
    .datos-generales { display: flex; gap: 40px; margin: 4px 0 12px; }
    .datos-col { flex: 1; display: flex; flex-direction: column; }
    .data-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .data-label { font-weight: bold; font-size: 8.5pt; min-width: 130px; white-space: nowrap; }
    .data-value {
      flex: 1;
      font-size: 9pt;
      text-align: center;
      border: none;
      border-bottom: 1px solid #333;
      padding: 2px 4px;
      min-height: 16px;
    }

    /* ── CUERPO: tabla  ── */
    .cuerpo { display: flex; gap: 6px; align-items: flex-start; }
    .tabla-wrap { flex: 1; }

    table { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: fixed; border: 1px solid #aaa; }
    thead tr { height: ${HEAD_H}px; }
    th {
      background: #1a4fa0;
      color: #fff;
      border: 1px solid #555;
      padding: 3px 4px;
      text-align: center;
      font-size: 7.5pt;
      line-height: 1.2;
    }
    td {
      border: 1px solid #aaa;
      padding: 1px 5px;
      font-size: 8pt;
      overflow: hidden;
      vertical-align: middle;
    }
    col.col-item { width: 34px; }
    col.col-desc { width: auto; }
    col.col-traz { width: 130px; }
    col.col-num { width: 60px; }
    col.col-total { width: 75px; }

    .celda-item { text-align: center; }
    .celda-desc { text-align: left; }
    .desc-linea1 {
      color: #1a4fa0;
      font-weight: bold;
      font-size: 8pt;
      line-height: 1.15;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .desc-linea2 { color: #555; font-size: 7pt; font-weight: normal; white-space: nowrap; }
    .celda-traz { text-align: center; }
    .traz-linea1 { color: #1a4fa0; font-size: 7.5pt; line-height: 1.15; }
    .celda-num { text-align: center; }
    .celda-total { text-align: right; }

    .tr-total { background: #dde4ef; font-weight: bold; height: ${ROW_H}px; }
    .tr-total td { border: 1px solid #888; }

    /* ── MOTIVO DE INGRESO ── */
    .motivo {
      margin-top: 10px;
      font-size: 8.5pt;
      display: flex;
      justify-content: space-around;
      gap: 26px;
      margin-left: 14.3%;
      margin-right: 14.3%;   
    }
    .motivo b { font-weight: bold; }

    /* ── OBSERVACIONES ── */
    .observaciones { 
      margin-top: 10px; 
      font-size: 8.5pt; 
      margin-bottom: 14px;   
      margin-left: 14.3%;
      margin-right: 14.3%;
    }
    .obs-lineas { margin-top: 6px; }
    .obs-linea {
      border-bottom: 1px solid #999;
      padding: 2px 2px 3px;
      min-height: 14px;
      font-size: 8.5pt;
    }
    /* ── FIRMAS ── */
    .firmas { display: flex; justify-content: space-around; margin-top: 24px; padding-top: 8px; }
    .firma-box { text-align: center; flex: 1; padding: 0 8px; }
    .firma-linea { border-top: 1px solid #000; margin-bottom: 4px; margin-top: 18px; }
    .firma-titulo { font-weight: bold; font-size: 7.5pt; }
    .firma-nombre { font-size: 7.5pt; margin-top: 2px; }

    @page { size: A4 landscape; margin: 0; }
    @media print { body { padding: 8mm 10mm; } }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="header">
    <img src="logo_karsol.png" class="header-img" alt="Logo" />
    <div class="header-logo">
      <span class="logo-nombre">PESQUERA KARSOL S.A.C</span>
      <div class="header-address">
        Av. Villa del Mar 760 - Coishco<br>
        Email: o.bazan@karsol.com.pe<br>
        Celular: 933062291<br>
        R.U.C. 20445375595
      </div>
    </div>
    <div class="header-title">
      <div class="title-box">CONTROL DE INGRESO A CÁMARA</div>
    </div>
    <div class="header-numero">
      <span class="numero-text">N&deg; ${codigo || "---"}</span>
    </div>
  </div>

  <!-- DATOS GENERALES -->
  <div class="datos-generales">
    <div class="datos-col">
      <div class="data-row"><span class="data-label">FECHA:</span><span class="data-value">${fecha || "-"}</span></div>
      <div class="data-row"><span class="data-label">USUARIO:</span><span class="data-value">${cliente || "-"}</span></div>
      <div class="data-row"><span class="data-label">FECHA PRODUCCIÓN:</span><span class="data-value">VER DESCRIPCIÓN</span></div>
      <div class="data-row"><span class="data-label">TURNO:</span><span class="data-value">${turno || "-"}</span></div>
    </div>
    <div class="datos-col">
      <div class="data-row"><span class="data-label">LOTE:</span><span class="data-value">${codigo_trazabilidad || "-"}</span></div>
      <div class="data-row"><span class="data-label">CÁMARA N°:</span><span class="data-value">${revision || "-"}</span></div>
      <div class="data-row"><span class="data-label">PRODUCTO:</span><span class="data-value">${especie_nombre || "-"}</span></div>
    </div>
  </div>

  <!-- CUERPO: TABLA -->
  <div class="cuerpo">
    <div class="tabla-wrap">
      <table>
        <colgroup>
          <col class="col-item"><col class="col-desc"><col class="col-traz">
          <col class="col-num"><col class="col-num"><col class="col-total">
        </colgroup>
        <thead>
          <tr>
            <th>ITEM</th>
            <th style="text-align:left">DESCRIPCIÓN DEL PRODUCTO</th>
            <th>CÓDIGO<br>TRAZABILIDAD</th>
            <th>CANTIDAD</th>
            <th>PESO<br>UNIDAD</th>
            <th>TOTAL<br>KG</th>
          </tr>
        </thead>
        <tbody>
          ${filasProductos}
          <tr class="tr-total">
            <td colspan="3">TOTAL INGRESO PRODUCTO DE CÁMARA</td>
            <td class="celda-num">${fmtEntero(totales.cajas)}</td>
            <td></td>
            <td class="celda-total">${fmtNum(totales.pesoNeto, 1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- MOTIVO DE INGRESO -->
  <div class="motivo">
    <span><b>MOTIVO DE INGRESO:</b></span>
    <span>1. PRODUCCIÓN ( ${marcaOn("produccion")} )</span>
    <span>2. REEMPAQUE ( ${marcaOn("reempaque")} )</span>
    <span>3. DESPACHO ( ${marcaOn("despacho")} )</span>
    <span>4. OTROS ( ${marcaOn("otros")} )</span>
  </div>

  <!-- OBSERVACIONES -->
  <div class="observaciones">
    <strong>OBSERVACIONES:</strong>
    <div class="obs-lineas">
      ${
        lineasObservaciones.length > 0
          ? lineasObservaciones
              .map((l) => `<div class="obs-linea">${l}</div>`)
              .join("")
          : `<div class="obs-linea">&nbsp;</div>`
      }
      <div class="obs-linea">&nbsp;</div>
    </div>
  </div>

  <!-- FIRMAS -->
  <div class="firmas">
    <div class="firma-box">
      <div class="firma-linea"></div>
      <div class="firma-titulo">V.°B.° JEFE DE CÁMARA</div>
      <div class="firma-nombre">JOSE ROQUE TEJADA</div>
    </div>
    <div class="firma-box">
      <div class="firma-linea"></div>
      <div class="firma-titulo">V.°B.° JEFE DE PLANTA</div>
      <div class="firma-nombre">HUGO GAMARRA CHUMPITAZ</div>
    </div>
    <div class="firma-box">
      <div class="firma-linea"></div>
      <div class="firma-titulo">V.°B.° CLIENTE</div>
    </div>
  </div>
</body>
</html>`;
}

export function PrintButtonIngreso({ parteId, parte }) {
  return (
    <PrintButton
      data={parte}
      id={parteId}
      obtenerPorId={partesService.obtenerParte}
      generarHtml={generarHtmlImpresion}
      title="Imprimir parte de producción"
    />
  );
}

export default PrintButtonIngreso;
