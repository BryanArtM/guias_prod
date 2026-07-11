import { Button, Input } from "@/components/common";
import { Plus, Trash2 } from "lucide-react";

export default function InsumosSection({ insumos, onChangeInsumos }) {
  const addInsumo = () => {
    onChangeInsumos([...insumos, { nombre: "", cantidad: 0 }]);
  };

  const removeInsumo = (index) => {
    onChangeInsumos(insumos.filter((_, i) => i !== index));
  };

  const updateInsumo = (index, field, value) => {
    const newInsumos = [...insumos];
    newInsumos[index][field] = value;
    onChangeInsumos(newInsumos);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Control de insumos
      </h2>

      <div className="space-y-3">
        {insumos.map((ins, index) => (
          <div key={ins.id ?? index} className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label={index === 0 ? "Nombre del Insumo" : ""}
                placeholder="Ej: Bolsas, Cajas..."
                value={ins.nombre}
                onChange={(e) => updateInsumo(index, "nombre", e.target.value)}
              />
            </div>
            <div className="w-32">
              <Input
                label={index === 0 ? "Cantidad" : ""}
                type="number"
                value={ins.cantidad}
                onChange={(e) =>
                  updateInsumo(index, "cantidad", e.target.value)
                }
              />
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => removeInsumo(index)}
              className={"w-10 h-10 p-0 flex items-center justify-center mb-1"}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}

        {insumos.length === 0 && (
          <p className="text-gray-400 text-sm italic">
            No se han registrado insumos.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="my-3"
        icon={<Plus size={14} />}
        iconPosition="left"
        onClick={addInsumo}
      >
        Añadir Insumo
      </Button>
    </div>
  );
}
