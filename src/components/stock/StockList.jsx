import { useEffect, useMemo, useState } from "react";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/common/Table";
import { Button, Alert, Select } from "@/components/common";
import { Download, RefreshCw } from "lucide-react";
import { obtenerStockActual } from "@/services";

export default function StockList() {
  const [stock, setStock] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [soloConStock, setSoloConStock] = useState(false);

  useEffect(() => {
    cargarStock();
  }, []);

  const mostrarAlerta = (mensaje, tipo = "success") => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), tipo === "success" ? 3000 : 5000);
  };

  const cargarStock = async () => {
    setCargando(true);
    try {
      const data = await obtenerStockActual();
      setStock(data || []);
    } catch (error) {
      mostrarAlerta("Error al cargar stock: " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const stockFiltrado = useMemo(() => {
    return stock.filter((item) => {
      if (filtroCodigo && !item.codigo_completo.includes(filtroCodigo)) {
        return false;
      }
      if (soloConStock && Number(item.stock_kg) <= 0) {
        return false;
      }
      return true;
    });
  }, [stock, filtroCodigo, soloConStock]);

  const exportarCSV = () => {
    const headers = ["Código Variante", "Kg Stock", "Cajas Stock"];
    const csv = [
      headers.join(","),
      ...stockFiltrado.map((s) =>
        [`"${s.codigo_completo}"`, s.stock_kg, s.stock_cajas].join(","),
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
        <h2 className="text-2xl font-bold text-gray-800">Stock Actual</h2>
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

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filtrar por código"
            value={filtroCodigo}
            onChange={(e) => setFiltroCodigo(e.target.value)}
          >
            <option value="">Todos</option>
            {[
              ...new Set(
                stock.map((item) => item.codigo_completo.split(" ")[0]),
              ),
            ]
              .filter(Boolean)
              .sort()
              .map((codigo) => (
                <option key={codigo} value={codigo}>
                  {codigo}
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
        <p className="text-sm text-gray-600 mt-2">
          Mostrando {stockFiltrado.length} de {stock.length} variantes
        </p>
      </div>

      {stockFiltrado.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay variantes con stock disponible
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código Variante</TableHead>
              <TableHead className="text-right">Kg Stock</TableHead>
              <TableHead className="text-right">Cajas Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockFiltrado.map((item) => (
              <TableRow key={item.variante_id}>
                <td>
                  <span className="font-mono text-sm font-semibold text-blue-700">
                    {item.codigo_completo}
                  </span>
                </td>
                <td className="text-right font-semibold">
                  {Number(item.stock_kg || 0).toFixed(2)}
                </td>
                <td className="text-right">{Number(item.stock_cajas || 0)}</td>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
