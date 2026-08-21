import { Input, Select } from "@/components/common";

export default function ControlHeaderSection({
  formData,
  onChange,
  especies = [],
  tipoDocumento,
  errors = {},
}) {
  return (
    <div className="mb-4 border border-line bg-surface p-3 rounded-sm">
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-line pb-1.5">
        <h2 className="label-col">
          Control de salida de cámara y/o despacho
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Número de Control"
          name="numero_control"
          value={formData.numero_control}
          onChange={onChange}
          error={errors.numero_control}
          required
        />
        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={onChange}
          error={errors.fecha}
          required
        />
        <Input
          label="Cliente"
          name="cliente"
          value={formData.cliente}
          onChange={onChange}
          error={errors.cliente}
          required
        />
        <Input
          label="Fecha Producción"
          name="fecha_produccion"
          type="date"
          value={formData.fecha_produccion}
          onChange={onChange}
          error={errors.fecha_produccion}
        />
        <Select
          label="Turno"
          name="turno"
          value={formData.turno}
          onChange={onChange}
          error={errors.turno}
          required
        >
          <option value="">Seleccione un turno</option>
          <option value="DIA">DÍA</option>
          <option value="TARDE">TARDE</option>
          <option value="NOCHE">NOCHE</option>
        </Select>
        <Input
          label="Número de Lote"
          name="numero_lote"
          value={formData.numero_lote}
          onChange={onChange}
          error={errors.numero_lote}
          required
        />
        <Input
          label="Número de Cámara"
          name="numero_camara"
          value={formData.numero_camara}
          onChange={onChange}
          error={errors.numero_camara}
          required
        />
        <Select
          label="Especie"
          name="especie_id"
          value={formData.especie_id}
          onChange={onChange}
          error={errors.especie_id}
          required
        >
          <option value="">Seleccione una especie</option>
          {especies.map((especie) => (
            <option key={especie.id} value={especie.id}>
              {especie.nombre}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
