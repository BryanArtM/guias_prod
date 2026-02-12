import { useState, useEffect } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Alert, Select } from "@/components/common";
import { Filter, Download, RefreshCw } from "lucide-react";
import { obtenerStockPorVariante } from "@/services";

export default function StockList() {
  const [stock, setStock] = useState([]);
  const [stockFiltrado, setStockFiltrado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);

  // Filtros
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [filtroPresentacion, setFiltroPresentacion] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);

  // Listas únicas para filtros
  const [especies, setEspecies] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);

  useEffect(() => {
    cargarStock();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...stock];

    if (filtroEspecie) {
      resultado = resultado.filter((s) => s.especie_nombre === filtroEspecie);
    }

    if (filtroPresentacion) {
      resultado = resultado.filter(
        (s) => s.presentacion_nombre === filtroPresentacion,
      );
    }

    if (soloConStock) {
      resultado = resultado.filter((s) => s.kg_stock > 0);
    }

    setStockFiltrado(resultado);
  }, [stock, filtroEspecie, filtroPresentacion, soloConStock]);

  // Extraer especies y presentaciones únicas
  useEffect(() => {
    const especiesUnicas = [
      ...new Set(stock.map((s) => s.especie_nombre)),
    ].sort();
    const presentacionesUnicas = [
      ...new Set(stock.map((s) => s.presentacion_nombre)),
    ].sort();
    setEspecies(especiesUnicas);
    setPresentaciones(presentacionesUnicas);
  }, [stock]);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const cargarStock = async () => {
    setCargando(true);
    try {
      const data = await obtenerStockPorVariante();
      setStock(data);
    } catch (error) {
      mostrarAlerta("Error al cargar stock: " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const obtenerColorStock = (kgStock) => {
    if (kgStock === 0) return "text-gray-500";
    if (kgStock < 10) return "text-red-600 font-semibold";
    if (kgStock < 100) return "text-yellow-600 font-semibold";
    return "text-green-600 font-semibold";
  };

  const obtenerIndicadorStock = (kgStock) => {
    if (kgStock === 0) return "⚪";
    if (kgStock < 10) return "🔴";
    if (kgStock < 100) return "🟡";
    return "🟢";
  };

  const exportarCSV = () => {
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

    const csv = [
      headers.join(","),
      ...stockFiltrado.map((s) =>
        [
          `"${s.codigo_completo}"`,
          `"${s.especie_nombre}"`,
          `"${s.presentacion_nombre}"`,
          s.kg_ingresados,
          s.kg_salidos,
          s.kg_stock,
          s.cajas_ingresadas,
          s.cajas_salidas,
          s.cajas_stock,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    mostrarAlerta("Stock exportado a CSV exitosamente");
  };

  const limpiarFiltros = () => {
    setFiltroEspecie("");
    setFiltroPresentacion("");
    setSoloConStock(false);
  };

  const hayFiltrosActivos = filtroEspecie || filtroPresentacion || soloConStock;

  if (cargando) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {alerta && (
        <Alert type={alerta.tipo} className="mb-4">
          {alerta.mensaje}
        </Alert>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Stock de Inventario
        </h2>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={cargarStock}
            icon={<RefreshCw className="w-4 h-4" />}
            iconPosition="left"
          >
            Actualizar
          </Button>
          <Button
            onClick={exportarCSV}
            icon={<Download className="w-4 h-4" />}
            iconPosition="left"
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Filtrar por Especie"
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
            >
              <option value="">Todas las especies</option>
              {especies.map((especie, idx) => (
                <option key={idx} value={especie}>
                  {especie}
                </option>
              ))}
            </Select>

            <Select
              label="Filtrar por Presentación"
              value={filtroPresentacion}
              onChange={(e) => setFiltroPresentacion(e.target.value)}
            >
              <option value="">Todas las presentaciones</option>
              {presentaciones.map((presentacion, idx) => (
                <option key={idx} value={presentacion}>
                  {presentacion}
                </option>
              ))}
            </Select>

            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloConStock}
                  onChange={(e) => setSoloConStock(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo con stock &gt; 0
                </span>
              </label>
            </div>
          </div>

          {hayFiltrosActivos && (
            <Button variant="secondary" onClick={limpiarFiltros}>
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Leyenda de colores */}
        <div className="flex justify-around text-sm py-4">
          <span className="flex items-center gap-1">
            🟢 <span>Stock &gt; 100 kg</span>
          </span>
          <span className="flex items-center gap-1">
            🟡 <span>Stock 10-100 kg</span>
          </span>
          <span className="flex items-center gap-1">
            🔴 <span>Stock &lt; 10 kg</span>
          </span>
          <span className="flex items-center gap-1">
            ⚪ <span>Sin stock</span>
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Mostrando {stockFiltrado.length} de {stock.length} variantes
        </p>
      </div>

      {stockFiltrado.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {stock.length === 0
            ? "No hay variantes con movimientos de stock"
            : "No se encontraron variantes con los filtros aplicados"}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estado</TableHead>
              <TableHead>Código Variante</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Presentación</TableHead>
              <TableHead className="text-right">Kg Ingresados</TableHead>
              <TableHead className="text-right">Kg Salidos</TableHead>
              <TableHead className="text-right">Kg Stock</TableHead>
              <TableHead className="text-right">Cajas Ingresadas</TableHead>
              <TableHead className="text-right">Cajas Salidas</TableHead>
              <TableHead className="text-right">Cajas Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockFiltrado.map((item) => (
              <TableRow key={item.variante_id}>
                <TableCell className="text-center text-xl">
                  {obtenerIndicadorStock(item.kg_stock)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-semibold text-blue-700">
                    {item.codigo_completo}
                  </span>
                </TableCell>
                <TableCell>{item.especie_nombre}</TableCell>
                <TableCell>{item.presentacion_nombre}</TableCell>
                <TableCell className="text-right text-gray-600">
                  {item.kg_ingresados.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {item.kg_salidos.toFixed(2)}
                </TableCell>
                <TableCell
                  className={`text-right ${obtenerColorStock(item.kg_stock)}`}
                >
                  {item.kg_stock.toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {item.cajas_ingresadas}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {item.cajas_salidas}
                </TableCell>
                <TableCell
                  className={`text-right ${obtenerColorStock(item.kg_stock)}`}
                >
                  {item.cajas_stock}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
