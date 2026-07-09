import { useEffect, useMemo } from "react";
import { Button, Select } from "@/components/common";
import { Plus, Trash2 } from "lucide-react";

export default function PackedProductSection({
  productos,
  variantes = [],
  especieId,
  onChangeProductos,
  totalRecepcion,
}) {
  const variantesFiltradas = useMemo(() => {
    if (!especieId) {
      return [];
    }

    const especieIdNumerico = parseInt(especieId, 10);
    return variantes.filter(
      (variante) => variante.especie_id === especieIdNumerico,
    );
  }, [especieId, variantes]);

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

  const addProducto = () => {
    onChangeProductos([
      ...productos,
      {
        variante_id: "",
        peso_unidad: 10,
        cajas_carro_1: 0,
        cajas_carro_2: 0,
        cajas_carro_3: 0,
        cajas_carro_4: 0,
        peso_total_neto_kg: 0,
        acumulado_presentacion: 0,
        rendimiento: 0,
      },
    ]);
  };

  const removeProducto = (index) => {
    onChangeProductos(productos.filter((_, i) => i !== index));
  };

  const updateProducto = (index, field, value) => {
    const newProductos = [...productos];
    newProductos[index][field] = value;

    // Recalcular
    const p = newProductos[index];
    const totalCajas =
      (parseInt(p.cajas_carro_1) || 0) +
      (parseInt(p.cajas_carro_2) || 0) +
      (parseInt(p.cajas_carro_3) || 0) +
      (parseInt(p.cajas_carro_4) || 0);

    p.peso_total_neto_kg = totalCajas * (parseFloat(p.peso_unidad) || 0);

    p.acumulado_presentacion = p.peso_total_neto_kg;

    if (totalRecepcion > 0) {
      p.rendimiento = (p.acumulado_presentacion * 100) / totalRecepcion;
    } else {
      p.rendimiento = 0;
    }

    onChangeProductos(newProductos);
  };

  const sumas = productos.reduce(
    (acc, p) => {
      acc.cajas +=
        (parseInt(p.cajas_carro_1) || 0) +
        (parseInt(p.cajas_carro_2) || 0) +
        (parseInt(p.cajas_carro_3) || 0) +
        (parseInt(p.cajas_carro_4) || 0);
      acc.pesoNeto += parseFloat(p.peso_total_neto_kg) || 0;
      acc.acumulado += parseFloat(p.acumulado_presentacion) || 0;
      acc.rendimiento += parseFloat(p.rendimiento) || 0;
      return acc;
    },
    { cajas: 0, pesoNeto: 0, acumulado: 0, rendimiento: 0 },
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Producto empacado
      </h2>

      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
          <tr>
            <th className="p-2 border">Presentación / Variante</th>
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
          {productos.map((p, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="p-1 border">
                <Select
                  value={p.variante_id}
                  onChange={(e) =>
                    updateProducto(
                      index,
                      "variante_id",
                      e.target.value ? parseInt(e.target.value, 10) : "",
                    )
                  }
                  className="border-none bg-transparent"
                  disabled={!especieId}
                >
                  <option value="">
                    {especieId
                      ? "Selección..."
                      : "Primero seleccione una especie"}
                  </option>
                  {variantesFiltradas.map((v) => (
                    <option key={v.variante_id} value={v.variante_id}>
                      {v.codigo_completo}
                    </option>
                  ))}
                </Select>
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                  value={p.peso_unidad}
                  onChange={(e) =>
                    updateProducto(index, "peso_unidad", e.target.value)
                  }
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                  value={p.cajas_carro_1}
                  onChange={(e) =>
                    updateProducto(index, "cajas_carro_1", e.target.value)
                  }
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                  value={p.cajas_carro_2}
                  onChange={(e) =>
                    updateProducto(index, "cajas_carro_2", e.target.value)
                  }
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                  value={p.cajas_carro_3}
                  onChange={(e) =>
                    updateProducto(index, "cajas_carro_3", e.target.value)
                  }
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-1 border-none bg-transparent focus:ring-0"
                  value={p.cajas_carro_4}
                  onChange={(e) =>
                    updateProducto(index, "cajas_carro_4", e.target.value)
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
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-bold">
          <tr>
            <td className="p-2 border">TOTALES</td>
            <td className="p-2 border"></td>
            <td colSpan="4" className="p-2 border text-center text-blue-800">
              {sumas.cajas} cajas
            </td>
            <td className="p-2 border text-blue-800">
              {sumas.pesoNeto.toFixed(2)} kg
            </td>
            <td className="p-2 border text-green-800">
              {sumas.rendimiento.toFixed(2)}%
            </td>
            <td className="p-2 border"></td>
          </tr>
        </tfoot>
      </table>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="my-3"
        icon={<Plus size={14} />}
        iconPosition="left"
        onClick={addProducto}
      >
        Añadir Fila de Producción
      </Button>
    </div>
  );
}
