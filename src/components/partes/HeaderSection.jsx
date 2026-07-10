import { Input, Select } from "@/components/common";

export default function HeaderSection({ formData, onChange }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Información General
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          label="Cliente"
          name="cliente"
          value={formData.cliente}
          onChange={onChange}
          placeholder="Empresa cliente..."
        />
        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={onChange}
        />
        <Select
          label="Turno"
          name="turno"
          value={formData.turno}
          onChange={onChange}
        >
          <option value="DIA">DÍA</option>
          <option value="TARDE">TARDE</option>
          <option value="NOCHE">NOCHE</option>
        </Select>
        <Input
          label="Código Trazabilidad"
          name="codigo_trazabilidad"
          value={formData.codigo_trazabilidad}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
