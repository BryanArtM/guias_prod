import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { Button, Select, Alert } from "@/components/common";
import {
  obtenerIngresos,
  obtenerSalidas,
  obtenerStockActual,
  obtenerVariantesCompletas,
  obtenerEspecies,
} from "@/services";

export default function ReportesPage() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [tipoReporte, setTipoReporte] = useState("movimientos");
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    especieId: "",
  });
  const [especies, setEspecies] = useState([]);

  useEffect(() => {
    cargarEspecies();
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    setFiltros({
      fechaInicio: hace30Dias.toISOString().split("T")[0],
      fechaFin: hoy.toISOString().split("T")[0],
      especieId: "",
    });
  }, []);

  const cargarEspecies = async () => {
    try {
      const data = await obtenerEspecies();
      setEspecies(data);
    } catch (error) {
      console.error("Error al cargar especies:", error);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const mostrarAlerta = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  // Exportar reporte de movimientos (Ingresos y Salidas)
  const exportarMovimientos = async () => {
    setLoading(true);
    try {
      const [ingresos, salidas, variantes] = await Promise.all([
        obtenerIngresos(),
        obtenerSalidas(),
        obtenerVariantesCompletas(),
      ]);

      // Filtrar por fechas
      const ingresosFiltrados = ingresos.filter(
        (i) => i.fecha >= filtros.fechaInicio && i.fecha <= filtros.fechaFin,
      );
      const salidasFiltradas = salidas.filter(
        (s) => s.fecha >= filtros.fechaInicio && s.fecha <= filtros.fechaFin,
      );

      // Crear mapa de variantes para lookup rápido
      const variantesMap = {};
      variantes.forEach((v) => {
        variantesMap[v.variante_id] = v;
      });

      // Combinar ingresos y salidas
      const movimientos = [
        ...ingresosFiltrados.map((i) => ({
          fecha: i.fecha,
          tipo: "INGRESO",
          variante_id: i.variante_id,
          codigo: variantesMap[i.variante_id]?.codigo_completo || "N/A",
          especie: variantesMap[i.variante_id]?.especie_nombre || "N/A",
          kg: i.kg,
          cajas: i.cajas || 0,
          observaciones: i.observaciones || "",
        })),
        ...salidasFiltradas.map((s) => ({
          fecha: s.fecha,
          tipo: "SALIDA",
          variante_id: s.variante_id || null,
          codigo: s.numero_control || s.tipo_documento_codigo || "N/A",
          especie: s.especie_nombre || "N/A",
          kg: s.suma_total_kg ?? s.kg ?? 0,
          cajas: s.suma_cantidad ?? s.cajas ?? 0,
          observaciones: s.observaciones || "",
        })),
      ].sort((a, b) => b.fecha.localeCompare(a.fecha));

      // Filtrar por especie si está seleccionada
      const movimientosFiltrados = filtros.especieId
        ? movimientos.filter(
            (m) =>
              variantesMap[m.variante_id]?.especie_id ===
              parseInt(filtros.especieId),
          )
        : movimientos;

      // Generar CSV
      const headers = [
        "Fecha",
        "Tipo",
        "Código Variante",
        "Especie",
        "Kg",
        "Cajas",
        "Observaciones",
      ];

      const csvContent = [
        headers.join(","),
        ...movimientosFiltrados.map((m) =>
          [
            m.fecha,
            m.tipo,
            `"${m.codigo}"`,
            `"${m.especie}"`,
            m.kg,
            m.cajas,
            `"${m.observaciones}"`,
          ].join(","),
        ),
      ].join("\n");

      descargarCSV(
        csvContent,
        `movimientos_${filtros.fechaInicio}_${filtros.fechaFin}.csv`,
      );
      mostrarAlerta("Reporte de movimientos exportado exitosamente");
    } catch (error) {
      mostrarAlerta("Error al exportar movimientos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Exportar reporte de stock
  const exportarStock = async () => {
    setLoading(true);
    try {
      const [stock, variantes] = await Promise.all([
        obtenerStockActual(),
        obtenerVariantesCompletas(),
      ]);

      const variantesMap = {};
      variantes.forEach((v) => {
        variantesMap[v.variante_id] = v;
      });

      // Filtrar por especie si está seleccionada
      const stockFiltrado = filtros.especieId
        ? stock.filter(
            (s) =>
              variantesMap[s.variante_id]?.especie_id ===
              parseInt(filtros.especieId),
          )
        : stock;

      // Generar CSV
      const headers = [
        "Código Variante",
        "Especie",
        "Presentación",
        "Kg Ingresados",
        "Kg Salidos",
        "Kg Stock",
        "Cajas Ingresadas",
        "Cajas Salidas",
        "Cajas Stock",
      ];

      const csvContent = [
        headers.join(","),
        ...stockFiltrado.map((s) =>
          [
            `"${s.codigo_completo}"`,
            `"${variantesMap[s.variante_id]?.especie_nombre || "N/A"}"`,
            `"${variantesMap[s.variante_id]?.presentacion_nombre || "N/A"}"`,
            s.stock_kg,
            0,
            s.stock_kg,
            s.stock_cajas,
            0,
            s.stock_cajas,
          ].join(","),
        ),
      ].join("\n");

      descargarCSV(
        csvContent,
        `stock_${new Date().toISOString().split("T")[0]}.csv`,
      );
      mostrarAlerta("Reporte de stock exportado exitosamente");
    } catch (error) {
      mostrarAlerta("Error al exportar stock: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Exportar reporte consolidado por especie
  const exportarConsolidado = async () => {
    setLoading(true);
    try {
      const [stock, especiesList, variantes] = await Promise.all([
        obtenerStockActual(),
        obtenerEspecies(),
        obtenerVariantesCompletas(),
      ]);

      const variantesMap = {};
      variantes.forEach((v) => {
        variantesMap[v.variante_id] = v;
      });

      // Agrupar stock por especie
      const consolidado = {};

      stock.forEach((item) => {
        const especie = variantesMap[item.variante_id]?.especie_nombre || "N/A";
        if (!consolidado[especie]) {
          consolidado[especie] = {
            especie,
            kg_ingresados: 0,
            kg_salidos: 0,
            kg_stock: 0,
            cajas_ingresadas: 0,
            cajas_salidas: 0,
            cajas_stock: 0,
            variantes_count: 0,
          };
        }

        consolidado[especie].kg_ingresados += item.stock_kg;
        consolidado[especie].kg_salidos += 0;
        consolidado[especie].kg_stock += item.stock_kg;
        consolidado[especie].cajas_ingresadas += item.stock_cajas;
        consolidado[especie].cajas_salidas += 0;
        consolidado[especie].cajas_stock += item.stock_cajas;
        consolidado[especie].variantes_count += 1;
      });

      const datosConsolidados = Object.values(consolidado);

      // Filtrar por especie si está seleccionada
      const datosFiltrados = filtros.especieId
        ? datosConsolidados.filter((d) => {
            const especie = especiesList.find((e) => e.nombre === d.especie);
            return especie && especie.id === parseInt(filtros.especieId);
          })
        : datosConsolidados;

      // Generar CSV
      const headers = [
        "Especie",
        "Variantes",
        "Kg Ingresados",
        "Kg Salidos",
        "Kg Stock",
        "Cajas Ingresadas",
        "Cajas Salidas",
        "Cajas Stock",
      ];

      const csvContent = [
        headers.join(","),
        ...datosFiltrados.map((d) =>
          [
            `"${d.especie}"`,
            d.variantes_count,
            d.kg_ingresados.toFixed(2),
            d.kg_salidos.toFixed(2),
            d.kg_stock.toFixed(2),
            d.cajas_ingresadas,
            d.cajas_salidas,
            d.cajas_stock,
          ].join(","),
        ),
      ].join("\n");

      descargarCSV(
        csvContent,
        `consolidado_especie_${new Date().toISOString().split("T")[0]}.csv`,
      );
      mostrarAlerta("Reporte consolidado exportado exitosamente");
    } catch (error) {
      mostrarAlerta("Error al exportar consolidado: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const descargarCSV = (contenido, nombreArchivo) => {
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerarReporte = () => {
    switch (tipoReporte) {
      case "movimientos":
        exportarMovimientos();
        break;
      case "stock":
        exportarStock();
        break;
      case "consolidado":
        exportarConsolidado();
        break;
      default:
        mostrarAlerta("Tipo de reporte no válido", "error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
        <p className="text-gray-600">
          Genere y exporte reportes personalizados del sistema
        </p>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert variant={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Selector de tipo de reporte */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Tipo de Reporte
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setTipoReporte("movimientos")}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                tipoReporte === "movimientos"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Movimientos</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ingresos y salidas por rango de fechas
              </p>
            </button>

            <button
              onClick={() => setTipoReporte("stock")}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                tipoReporte === "stock"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Stock Actual</h3>
              </div>
              <p className="text-sm text-gray-600">
                Inventario actual por variante
              </p>
            </button>

            <button
              onClick={() => setTipoReporte("consolidado")}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                tipoReporte === "consolidado"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Consolidado</h3>
              </div>
              <p className="text-sm text-gray-600">
                Resumen agrupado por especie
              </p>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tipoReporte === "movimientos" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={filtros.fechaInicio}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={filtros.fechaFin}
                    onChange={handleFiltroChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <Select
              label="Filtrar por Especie (Opcional)"
              name="especieId"
              value={filtros.especieId}
              onChange={handleFiltroChange}
            >
              <option value="">Todas las especies</option>
              {especies.map((especie) => (
                <option key={especie.id} value={especie.id}>
                  {especie.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Botón de generación */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerarReporte}
            disabled={loading}
            className="flex items-center gap-2"
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
          >
            {loading ? "Generando..." : <>Generar y Descargar Reporte</>}
          </Button>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          Información sobre los reportes
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <strong>Movimientos:</strong> Exporta todos los ingresos y salidas
            en el rango de fechas seleccionado
          </li>
          <li>
            • <strong>Stock Actual:</strong> Exporta el inventario actual de
            todas las variantes
          </li>
          <li>
            • <strong>Consolidado:</strong> Exporta un resumen agrupado por
            especie con totales
          </li>
          <li>
            • Todos los reportes se descargan en formato CSV compatible con
            Excel
          </li>
        </ul>
      </div>
    </div>
  );
}
