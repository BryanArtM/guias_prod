import { Button } from "@/components/common";
import { Plus, Trash2 } from "lucide-react";


export default function ControlItemsSection({
  items,
  onChangeItems,
  motivoSalida,
  onChangeMotivoSalida,
  motivos = [],
  variantes = [],
  error,
}) {
  const addItem = () => {
    onChangeItems([
      ...items,
      {
        variante_id: "",
        codigo_trazabilidad: "",
        cantidad: 0,
        peso_unidad: 0,
        motivo_salida: "OTROS",
      },
    ]);
  };

  const removeItem = (index) => {
    onChangeItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateItem = (index, field, value) => {
    const nextItems = [...items];
    nextItems[index][field] = value;
    onChangeItems(nextItems);
  };

  const itemsConTotales = items.map((item, index) => {
    const cantidad = parseFloat(item.cantidad) || 0;
    const pesoUnidad = parseFloat(item.peso_unidad) || 0;
    return {
      ...item,
      numero_item: index + 1,
      total_kg: cantidad * pesoUnidad,
    };
  });

  const sumaCantidad = itemsConTotales.reduce(
    (total, item) => total + (parseFloat(item.cantidad) || 0),
    0,
  );
  const sumaTotalKg = itemsConTotales.reduce(
    (total, item) => total + (parseFloat(item.total_kg) || 0),
    0,
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between gap-4 mb-4 border-b pb-2">
        <h2 className="text-lg font-bold text-gray-800">Lista de salida</h2>
        <div className="text-sm text-gray-600">
          Suma cantidad: <span className="font-semibold">{sumaCantidad}</span> |{" "}
          Suma total kg:{" "}
          <span className="font-semibold">{sumaTotalKg.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <table className="w-full text-sm text-left border-collapse min-w-[1100px]">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
          <tr>
            <th className="p-2 border w-16">Item</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">Código Trazabilidad</th>
            <th className="p-2 border w-24">Cantidad</th>
            <th className="p-2 border w-28">Peso Unidad</th>
            <th className="p-2 border w-28">Total Kg</th>
            <th className="p-2 border w-12"></th>
          </tr>
        </thead>
        <tbody>
          {itemsConTotales.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="p-2 border text-center font-semibold">
                {item.numero_item}
              </td>
              <td className="p-1 border">
                <select
                  className="w-full p-2 border-none bg-transparent focus:ring-0"
                  value={item.variante_id}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "variante_id",
                      e.target.value ? parseInt(e.target.value, 10) : "",
                    )
                  }
                >
                  <option value="">Seleccione...</option>
                  {variantes.map((v) => (
                    <option key={v.variante_id} value={v.variante_id}>
                      {v.codigo_completo}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-1 border">
                <input
                  type="text"
                  className="w-full p-2 border-none bg-transparent focus:ring-0"
                  value={item.codigo_trazabilidad}
                  onChange={(e) =>
                    updateItem(index, "codigo_trazabilidad", e.target.value)
                  }
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-2 border-none bg-transparent focus:ring-0"
                  value={item.cantidad}
                  onChange={(e) =>
                    updateItem(index, "cantidad", e.target.value)
                  }
                  min="0"
                />
              </td>
              <td className="p-1 border">
                <input
                  type="number"
                  className="w-full p-2 border-none bg-transparent focus:ring-0"
                  value={item.peso_unidad}
                  onChange={(e) =>
                    updateItem(index, "peso_unidad", e.target.value)
                  }
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="p-2 border font-semibold text-blue-600 bg-blue-50/30">
                {item.total_kg.toFixed(2)}
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
          ))}
        </tbody>
        <tfoot className="bg-gray-100 font-bold">
          <tr>
            <td className="p-2 border">TOTALES</td>
            <td className="p-2 border" colSpan="2"></td>
            <td className="p-2 border text-center text-blue-800">
              {sumaCantidad}
            </td>
            <td className="p-2 border"></td>
            <td className="p-2 border text-blue-800">
              {sumaTotalKg.toFixed(2)}
            </td>
            <td className="p-2 border" colSpan="2"></td>
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
        onClick={addItem}
      >
        Añadir Ítem
      </Button>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-gray-700">
          Motivo de Salida:
        </span>
        <div className="flex gap-2">
          {motivos.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChangeMotivoSalida(m.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                motivoSalida === m.id
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
