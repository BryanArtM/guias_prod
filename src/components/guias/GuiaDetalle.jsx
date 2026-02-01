import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { obtenerGuiaCompleta } from "../../services/api";
import {
  previsualizarPDF,
  descargarPDF,
  imprimirPDF,
} from "../../services/pdfService";
import { ArrowLeft, Eye, Download, Printer } from "lucide-react";
import { Button, Card, Table, Loading } from "../common";

export const GuiaDetalle = ({ guiaId, onClose }) => {
  const [guiaCompleta, setGuiaCompleta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGuia();
  }, [guiaId]);

  const cargarGuia = async () => {
    try {
      setLoading(true);
      const data = await obtenerGuiaCompleta(guiaId);
      setGuiaCompleta(data);
    } catch (error) {
      console.error("Error al cargar guía:", error);
      alert("Error al cargar la guía");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevisualizar = () => {
    if (guiaCompleta) {
      previsualizarPDF(guiaCompleta);
    }
  };

  const handleDescargar = () => {
    if (guiaCompleta) {
      descargarPDF(guiaCompleta);
    }
  };

  const handleImprimir = () => {
    if (guiaCompleta) {
      imprimirPDF(guiaCompleta);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" text="Cargando guía..." />
        </div>
      </div>
    );
  }

  if (!guiaCompleta) {
    return (
      <div className="p-6">
        <Card padding="xl">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No se pudo cargar la guía</p>
            <Button onClick={onClose} variant="secondary" className="mt-4">
              Volver
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const columnasProductos = [
    { key: "codigo", header: "Código", align: "left" },
    { key: "producto", header: "Producto", align: "left" },
    { key: "cantidad", header: "Cantidad", align: "right" },
    { key: "unidad", header: "Unidad", align: "left" },
    { key: "lote", header: "Lote", align: "left" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onClose}
            variant="secondary"
            icon={<ArrowLeft size={20} />}
          >
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Guía {guiaCompleta.guia.numero_guia}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePrevisualizar}
            variant="secondary"
            icon={<Eye size={20} />}
          >
            Vista Previa
          </Button>
          <Button
            onClick={handleDescargar}
            variant="success"
            icon={<Download size={20} />}
          >
            Descargar PDF
          </Button>
          <Button
            onClick={handleImprimir}
            variant="primary"
            icon={<Printer size={20} />}
          >
            Imprimir
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Información de la Guía
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Número de Guía
              </p>
              <p className="text-lg font-semibold">
                {guiaCompleta.guia.numero_guia}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha</p>
              <p className="text-lg">{guiaCompleta.guia.fecha}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Responsable</p>
              <p className="text-lg">{guiaCompleta.guia.responsable}</p>
            </div>
            {guiaCompleta.guia.observaciones && (
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">
                  Observaciones
                </p>
                <p className="text-lg">{guiaCompleta.guia.observaciones}</p>
              </div>
            )}
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Productos ({guiaCompleta.detalles.length})
          </h2>

          {guiaCompleta.detalles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay productos en esta guía
            </p>
          ) : (
            <Table
              columns={columnasProductos}
              data={guiaCompleta.detalles}
              hover
              renderRow={(detalle) => (
                <>
                  <td className="py-3 px-4 font-mono text-sm">
                    {detalle.producto_codigo}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {detalle.producto_nombre}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    {detalle.cantidad}
                  </td>
                  <td className="py-3 px-4">{detalle.producto_unidad}</td>
                  <td className="py-3 px-4 font-mono text-sm">
                    {detalle.lote}
                  </td>
                </>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
GuiaDetalle.propTypes = {
  guiaId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
