import { Input, Select } from "@/components/common";

export default function HeaderSection({ formData, onChange }) {
  return (
    <div className="mb-4 border border-line bg-surface p-3 rounded-sm">
      <h2 className="label-col mb-3 border-b border-line pb-1.5">
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
