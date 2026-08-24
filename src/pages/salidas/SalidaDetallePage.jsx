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
import {
  Alert,
  Button,
  Campo,
  Loading,
  PageActions,
  Panel,
} from "@/components/common";
import { ArrowLeft, Pencil, Package } from "lucide-react";
import { PrintButtonSalida } from "@/components/salidas/ImpresionControlSalida";
import { controlService } from "@/services";

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
      <Loading />
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="error">{error}</Alert>
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
    usuario_nombre,
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
    <div className="space-y-4 px-5 py-4">
      <PageActions>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft />}
          title="Volver"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/salidas/${id}/editar`)}
          icon={<Pencil />}
          iconPosition="left"
        >
          Editar
        </Button>
        <PrintButtonSalida salida={salida} />
      </PageActions>

      <Panel title="Datos Generales">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Campo etiqueta="N° Control" valor={numero_control} mono />
          <Campo etiqueta="Cliente" valor={cliente} />
          <Campo etiqueta="Registrado por" valor={usuario_nombre} />
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
      </Panel>

      <Panel
        title={
          <span className="inline-flex items-center gap-2">
            <Package size={14} />
            Ítems
          </span>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variante</TableHead>
                <TableHead>Cód. Trazabilidad</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Peso Unidad</TableHead>
                <TableHead className="text-right">Total Kg</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={item.id ?? idx}>
                  <TableCell className="num font-medium text-navy">
                    {item.codigo_completo ?? item.variante_id}
                  </TableCell>
                  <TableCell className="num">
                    {item.codigo_trazabilidad ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">{item.cantidad}</TableCell>
                  <TableCell className="text-right">
                    {item.peso_unidad}
                  </TableCell>
                  <TableCell className="text-right">
                    {Number(item.total_kg).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableBody>
              <TableRow className="border-t border-line bg-gray-50 font-medium">
                <TableCell colSpan={2}>
                  <span className="label-col">Totales</span>
                </TableCell>
                <TableCell className="text-right">{suma_cantidad}</TableCell>
                <TableCell />
                <TableCell className="text-right">
                  {Number(suma_total_kg).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Panel>
    </div>
  );
}
