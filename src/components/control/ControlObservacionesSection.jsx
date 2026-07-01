export default function ControlObservacionesSection({
  value,
  onChange,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Observaciones
      </h2>
      <textarea
        name="observaciones"
        value={value}
        onChange={onChange}
        rows="6"
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Ingrese notas o comentarios..."
      />
    </div>
  );
}
