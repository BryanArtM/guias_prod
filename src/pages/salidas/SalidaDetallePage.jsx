import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TableModular as Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/common/Table";
import { Button, Alert, Card } from "@/components/common";
import { ArrowLeft, Pencil, Package } from "lucide-react";
import { PrintButtonSalida } from "@/components/salidas/ImpresionControlSalida";
import { controlService } from "@/services";

function Campo({ etiqueta, valor, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
        {etiqueta}
      </p>
      <p className="text-sm text-gray-800 font-medium">{valor ?? "-"}</p>
    </div>
  );
}

export default function SalidaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salida, setSalida] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await controlService.obtenerControlSalida(id);
        setSalida(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert type="error">{error}</Alert>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

  if (!salida) return null;

  const {
    numero_control,
    fecha,
    cliente,
    turno,
    numero_lote,
    numero_camara,
    especie_nombre,
    observaciones,
    tipo_documento_codigo,
    motivo_salida_codigo,
    suma_cantidad,
    suma_total_kg,
    items = [],
  } = salida;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Control de Salida
              {numero_control && (
                <span className="ml-2 text-blue-600">#{numero_control}</span>
              )}
            </h1>
            <p className="text-sm text-gray-500">{fecha}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/salidas/${id}/editar`)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Pencil className="w-4 h-4" /> Editar
        </button>
        <PrintButtonSalida salida={salida} />
      </div>

      <Card>
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Datos Generales
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Campo etiqueta="Cliente" valor={cliente} />
          <Campo etiqueta="Fecha" valor={fecha} />
          <Campo etiqueta="Turno" valor={turno} />
          <Campo etiqueta="Tipo Documento" valor={tipo_documento_codigo} />
          <Campo etiqueta="N° Lote" valor={numero_lote} />
          <Campo etiqueta="N° Cámara" valor={numero_camara} />
          <Campo etiqueta="Especie" valor={especie_nombre} />
          <Campo etiqueta="Motivo Salida" valor={motivo_salida_codigo} />
          <Campo
            etiqueta="Observaciones"
            valor={observaciones}
            className="col-span-2 whitespace-pre-wrap"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-gray-500" />
          <h3 className="text-base font-semibold text-gray-700">Ítems</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variante</TableHead>
                <TableHead>Cód. Trazabilidad</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Peso Unidad</TableHead>
                <TableHead>Total Kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id ?? idx}>
                  <TableCell>
                    <span className="font-mono text-sm text-blue-700">
                      {item.codigo_completo ?? item.variante_id}
                    </span>
                  </TableCell>
                  <TableCell>{item.codigo_trazabilidad ?? "-"}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{item.peso_unidad}</TableCell>
                  <TableCell>{Number(item.total_kg).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot className="bg-gray-100 font-semibold">
              <tr>
                <td className="p-2" colSpan={2}>
                  TOTALES
                </td>
                <td className="p-2">{suma_cantidad}</td>
                <td className="p-2"></td>
                <td className="p-2">{Number(suma_total_kg).toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </Card>
    </div>
  );
}
