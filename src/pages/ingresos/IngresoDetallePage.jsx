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
import { PrintButtonIngreso } from "@/components/ingresos/ImpresionParteProduccion";
import { ArrowLeft, Truck, Ship, Package, Pencil, Wrench } from "lucide-react";
import { partesService } from "@/services";

export default function IngresoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingreso, setIngreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await partesService.obtenerParte(id);
        setIngreso(data);
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

  if (!ingreso) return null;

  const {
    codigo,
    revision,
    version,
    cliente,
    usuario_nombre,
    fecha,
    turno,
    codigo_trazabilidad,
    especie_nombre: especie,
    entera,
    observaciones,
    motivo_ingreso_codigo,
    tipo_documento_codigo,
    transportes = [],
    productos = [],
    insumos = [],
  } = ingreso;

  const cantidadCarros = productos.reduce(
    (maximo, prod) => Math.max(maximo, prod.cajas_carros?.length ?? 0),
    transportes.length,
  );

  // El acumulado y el rendimiento son por presentacion
  const presentaciones = Array.from(
    productos
      .reduce((grupos, prod) => {
        const clave = prod.presentacion_id ?? "sin-presentacion";
        if (!grupos.has(clave)) {
          grupos.set(clave, {
            clave,
            nombre: prod.presentacion_nombre ?? "Sin presentación",
            filas: [],
          });
        }
        grupos.get(clave).filas.push(prod);
        return grupos;
      }, new Map())
      .values(),
  )
    .map((grupo) => ({
      ...grupo,
      pesoNeto: grupo.filas.reduce(
        (total, prod) => total + (Number(prod.peso_total_neto_kg) || 0),
        0,
      ),
      rendimiento: grupo.filas.find((prod) => prod.rendimiento != null)
        ?.rendimiento,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

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
          onClick={() => navigate(`/ingresos/${id}/editar`)}
          icon={<Pencil />}
          iconPosition="left"
        >
          Editar
        </Button>
        <PrintButtonIngreso parte={ingreso} />
      </PageActions>

      <Panel title="Documento">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <Campo etiqueta="Código" valor={codigo} mono />
          <Campo etiqueta="Revisión" valor={revision} mono />
          <Campo etiqueta="Versión" valor={version} mono />
          <Campo etiqueta="Tipo Documento" valor={tipo_documento_codigo} />
          <Campo etiqueta="Fecha" valor={fecha} mono />
        </div>
      </Panel>

      <Panel title="Datos Generales">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <Campo etiqueta="Cliente" valor={cliente} />
          <Campo etiqueta="Registrado por" valor={usuario_nombre} />
          <Campo etiqueta="Fecha" valor={fecha} />
          <Campo etiqueta="Turno" valor={turno} />
          <Campo etiqueta="Cód. Trazabilidad" valor={codigo_trazabilidad} />
          <Campo etiqueta="Especie" valor={especie} />
          <Campo
            etiqueta="Entera (kg)"
            valor={entera != null ? Number(entera).toFixed(2) : null}
          />
          <Campo
            etiqueta="Observaciones"
            valor={observaciones}
            className="col-span-2 whitespace-pre-wrap"
          />
          <Campo etiqueta="Motivo Ingreso" valor={motivo_ingreso_codigo} />
        </div>
      </Panel>

      {/* Transportes y embarcaciones */}
      {transportes.length > 0 && (
        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <Truck size={14} />
              Transportes
            </span>
          }
        >
          <div className="space-y-4">
            {transportes.map((transporte, idx) => (
              <div
                key={transporte.id}
                className="rounded-sm border border-line p-4"
              >
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                  Transporte {idx + 1}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <Campo etiqueta="N° Guía" valor={transporte.num_guia} />
                  <Campo etiqueta="N° Carro" valor={transporte.num_carro} />
                  <Campo etiqueta="Placa" valor={transporte.placa} />
                </div>

                {transporte.embarcaciones?.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3 mt-2">
                      <Ship className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">
                        Embarcaciones
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Matrícula</TableHead>
                            <TableHead>Peso Total (kg)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transporte.embarcaciones.map((emb) => (
                            <TableRow key={emb.id}>
                              <TableCell>
                                {emb.nombre_embarcacion_pesquera ?? "-"}
                              </TableCell>
                              <TableCell>
                                {emb.matricula_embarcacion_pesquera ?? "-"}
                              </TableCell>
                              <TableCell>
                                {emb.peso_total_kg != null
                                  ? Number(emb.peso_total_kg).toFixed(2)
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Productos */}
      {productos.length > 0 && (
        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <Package size={14} />
              Productos
            </span>
          }
        >
          <div className="space-y-4">
            {presentaciones.map((presentacion) => (
              <div
                key={presentacion.clave}
                className="overflow-hidden rounded-sm border border-line"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line bg-gray-50 px-3 py-2">
                  <span className="font-medium text-ink">
                    {presentacion.nombre}
                  </span>
                  <span className="flex items-baseline gap-4 text-xs text-gray-500">
                    <span>
                      Total:{" "}
                      <span className="num font-medium text-ink">
                        {presentacion.pesoNeto.toFixed(2)} kg
                      </span>
                    </span>
                    <span>
                      Rendimiento:{" "}
                      <span className="num font-medium text-ink">
                        {presentacion.rendimiento != null
                          ? `${Number(presentacion.rendimiento).toFixed(2)}%`
                          : "-"}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variante</TableHead>
                        <TableHead>Peso Unidad</TableHead>
                        {Array.from(
                          { length: cantidadCarros },
                          (_, indiceCarro) => (
                            <TableHead key={indiceCarro}>{`Carro ${
                              indiceCarro + 1
                            }`}</TableHead>
                          ),
                        )}
                        <TableHead>Total Neto (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presentacion.filas.map((prod) => (
                        <TableRow key={prod.id}>
                          <TableCell>
                            <span className="font-mono text-sm text-blue-700">
                              {prod.codigo_completo ??
                                `ID: ${prod.variante_id}`}
                            </span>
                          </TableCell>
                          <TableCell>{prod.peso_unidad ?? "-"}</TableCell>
                          {Array.from(
                            { length: cantidadCarros },
                            (_, indiceCarro) => (
                              <TableCell key={indiceCarro}>
                                {prod.cajas_carros?.[indiceCarro] ?? 0}
                              </TableCell>
                            ),
                          )}
                          <TableCell>
                            {prod.peso_total_neto_kg != null
                              ? Number(prod.peso_total_neto_kg).toFixed(2)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Insumos */}
      {insumos.length > 0 && (
        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <Wrench size={14} />
              Insumos
            </span>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cantidad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insumos.map((insumo) => (
                  <TableRow key={insumo.id}>
                    <TableCell>{insumo.nombre ?? "-"}</TableCell>
                    <TableCell>{insumo.cantidad ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>
      )}
    </div>
  );
}
