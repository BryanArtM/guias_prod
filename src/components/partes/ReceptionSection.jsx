import { Input, Button, Select } from "@/components/common";
import { Plus, Trash2 } from "lucide-react";

export default function ReceptionSection({
  especieId,
  entera,
  transportes,
  onChangeEspecie,
  onChangeEntera,
  onChangeTransportes,
  especies = [],
}) {
  const addTransporte = () => {
    onChangeTransportes([
      ...transportes,
      {
        num_guia: "",
        num_carro: "",
        placa: "",
        embarcaciones: [
          {
            nombre_embarcacion_pesquera: "",
            matricula_embarcacion_pesquera: "",
            peso_total_kg: 0,
          },
        ],
      },
    ]);
  };

  const removeTransporte = (index) => {
    const newTransportes = transportes.filter((_, i) => i !== index);
    onChangeTransportes(newTransportes);
  };

  const updateTransporte = (index, field, value) => {
    const newTransportes = [...transportes];
    newTransportes[index][field] = value;
    onChangeTransportes(newTransportes);
  };

  const addEmbarcacion = (tIndex) => {
    const newTransportes = [...transportes];
    newTransportes[tIndex].embarcaciones.push({
      nombre_embarcacion_pesquera: "",
      matricula_embarcacion_pesquera: "",
      peso_total_kg: 0,
    });
    onChangeTransportes(newTransportes);
  };

  const removeEmbarcacion = (tIndex, eIndex) => {
    const newTransportes = [...transportes];
    newTransportes[tIndex].embarcaciones = newTransportes[
      tIndex
    ].embarcaciones.filter((_, i) => i !== eIndex);
    onChangeTransportes(newTransportes);
  };

  const updateEmbarcacion = (tIndex, eIndex, field, value) => {
    const newTransportes = [...transportes];
    newTransportes[tIndex].embarcaciones[eIndex][field] = value;
    onChangeTransportes(newTransportes);
  };

  const totalPesoRecepcion = transportes.reduce((acc, t) => {
    return (
      acc +
      t.embarcaciones.reduce(
        (accE, e) => accE + (parseFloat(e.peso_total_kg) || 0),
        0,
      )
    );
  }, 0);

  const pesoParaFiletear = totalPesoRecepcion - (parseFloat(entera) || 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
        Recepción de materia prima
      </h2>

      <div className="flex my-6">
        <Select
          label="Especie"
          value={especieId}
          onChange={(e) => onChangeEspecie(e.target.value)}
        >
          <option value="">Seleccione una especie</option>
          {especies.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-6">
        {transportes.map((t, tIndex) => (
          <div
            key={t.id ?? tIndex}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-blue-700">
                Transporte {tIndex + 1}
              </h3>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeTransporte(tIndex)}
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Input
                label="Nro Guía"
                value={t.num_guia}
                onChange={(e) =>
                  updateTransporte(tIndex, "num_guia", e.target.value)
                }
              />
              <Input
                label="Nro Carro"
                value={t.num_carro}
                onChange={(e) =>
                  updateTransporte(tIndex, "num_carro", e.target.value)
                }
              />
              <Input
                label="Placa "
                value={t.placa}
                onChange={(e) =>
                  updateTransporte(tIndex, "placa", e.target.value)
                }
              />
            </div>

            <div className="ml-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase">
                Embarcaciones Pesqueras (E/P)
              </h4>
              {t.embarcaciones.map((e, eIndex) => (
                <div
                  key={e.id ?? eIndex}
                  className="flex flex-wrap items-end gap-3 p-3 bg-white rounded border border-gray-100"
                >
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      label="Nombre E/P"
                      value={e.nombre_embarcacion_pesquera}
                      onChange={(ev) =>
                        updateEmbarcacion(
                          tIndex,
                          eIndex,
                          "nombre_embarcacion_pesquera",
                          ev.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <Input
                      label="Matrícula"
                      value={e.matricula_embarcacion_pesquera}
                      onChange={(ev) =>
                        updateEmbarcacion(
                          tIndex,
                          eIndex,
                          "matricula_embarcacion_pesquera",
                          ev.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Peso (kg)"
                      type="number"
                      step="0.01"
                      value={e.peso_total_kg}
                      onChange={(ev) =>
                        updateEmbarcacion(
                          tIndex,
                          eIndex,
                          "peso_total_kg",
                          ev.target.value,
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeEmbarcacion(tIndex, eIndex)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full h-8"
                icon={<Plus size={14} />}
                iconPosition="left"
                onClick={() => addEmbarcacion(tIndex)}
              >
                Añadir Embarcación
              </Button>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full h-8 border-dashed border-2 border-blue-900"
          icon={<Plus size={14} />}
          iconPosition="left"
          onClick={addTransporte}
        >
          Añadir Transporte
        </Button>
      </div>
      <div className="flex my-6">
        <Input
          label="Entera (kg)"
          type="number"
          step="0.01"
          value={entera}
          onChange={(e) => onChangeEntera(e.target.value)}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-6 p-4 bg-gray-100 rounded-lg font-bold">
        <div className="text-gray-600">
          Total Recepción:{" "}
          <span className="text-blue-900">
            {totalPesoRecepcion.toFixed(2)} kg
          </span>
        </div>
        <div className="text-gray-600">
          Para Filetear:{" "}
          <span className="text-blue-900">
            {pesoParaFiletear.toFixed(2)} kg
          </span>
        </div>
      </div>
    </div>
  );
}
