export default function ControlObservacionesSection({
  value,
  onChange,
}) {
  return (
    <div className="mb-4 border border-line bg-surface p-3">
      <h2 className="label-col mb-3 border-b border-line pb-1.5">
        Observaciones
      </h2>
      <textarea
        name="observaciones"
        value={value}
        onChange={onChange}
        rows="6"
        className="w-full p-3 border border-line focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Ingrese notas o comentarios..."
      />
    </div>
  );
}
