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
import { Button, Alert } from "@/components/common";
import { ArrowLeft, Truck, Ship, Package, Wrench } from "lucide-react";
import { partesService } from "@/services";

function SeccionTitulo({ icono, titulo }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-500">{icono}</span>
      <h3 className="text-base font-semibold text-gray-700">{titulo}</h3>
    </div>
  );
}

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

function Tarjeta({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow p-5 ${className}`}>
      {children}
    </div>
  );
}

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

  if (!ingreso) return null;

  const {
    codigo,
    revision,
    version,
    cliente,
    fecha,
    turno,
    codigo_trazabilidad,
    especie_nombre: especie,
    entera,
    observaciones,
    tipo_documento,
    transportes = [],
    productos = [],
    insumos = [],
  } = ingreso;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Encabezado */}
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
            Parte de Producción
            {codigo && <span className="ml-2 text-blue-600">#{codigo}</span>}
          </h1>
          <p className="text-sm text-gray-500">{fecha}</p>
        </div>
      </div>

      {/* Datos generales */}
      <Tarjeta>
        <h3 className="text-base font-semibold text-gray-700 mb-4">
          Datos Generales
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Campo etiqueta="Código" valor={codigo} />
          <Campo etiqueta="Revisión" valor={revision} />
          <Campo etiqueta="Versión" valor={version} />
          <Campo etiqueta="Tipo Documento" valor={tipo_documento} />
          <Campo etiqueta="Cliente" valor={cliente} />
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
            className="col-span-2"
          />
        </div>
      </Tarjeta>

      {/* Transportes y embarcaciones */}
      {transportes.length > 0 && (
        <Tarjeta>
          <SeccionTitulo
            icono={<Truck className="w-4 h-4" />}
            titulo="Transportes"
          />
          <div className="space-y-4">
            {transportes.map((transporte, idx) => (
              <div
                key={transporte.id}
                className="border border-gray-100 rounded-lg p-4"
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
        </Tarjeta>
      )}

      {/* Productos */}
      {productos.length > 0 && (
        <Tarjeta>
          <SeccionTitulo
            icono={<Package className="w-4 h-4" />}
            titulo="Productos"
          />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variante</TableHead>
                  <TableHead>Peso Unidad</TableHead>
                  <TableHead>Carro 1</TableHead>
                  <TableHead>Carro 2</TableHead>
                  <TableHead>Carro 3</TableHead>
                  <TableHead>Carro 4</TableHead>
                  <TableHead>Total Neto (kg)</TableHead>
                  <TableHead>Acum. Presentación</TableHead>
                  <TableHead>Rendimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productos.map((prod) => (
                  <TableRow key={prod.id}>
                    <TableCell>
                      <span className="font-mono text-sm text-blue-700">
                        {prod.variante_id ?? `ID: ${prod.variante_id}`}
                      </span>
                    </TableCell>
                    <TableCell>{prod.peso_unidad ?? "-"}</TableCell>
                    <TableCell>{prod.cajas_carro_1 ?? 0}</TableCell>
                    <TableCell>{prod.cajas_carro_2 ?? 0}</TableCell>
                    <TableCell>{prod.cajas_carro_3 ?? 0}</TableCell>
                    <TableCell>{prod.cajas_carro_4 ?? 0}</TableCell>
                    <TableCell>
                      {prod.peso_total_neto_kg != null
                        ? Number(prod.peso_total_neto_kg).toFixed(2)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {prod.acumulado_presentacion != null
                        ? Number(prod.acumulado_presentacion).toFixed(2)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {prod.rendimiento != null
                        ? `${Number(prod.rendimiento).toFixed(2)}%`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Tarjeta>
      )}

      {/* Insumos */}
      {insumos.length > 0 && (
        <Tarjeta>
          <SeccionTitulo
            icono={<Wrench className="w-4 h-4" />}
            titulo="Insumos"
          />
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
        </Tarjeta>
      )}
    </div>
  );
}
