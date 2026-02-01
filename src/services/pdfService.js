import jsPDF from "jspdf";


export const generarPDFGuia = (guiaCompleta) => {
  const doc = new jsPDF();

  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 20;

  // Título
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("GUÍA DE PRODUCCIÓN", pageWidth / 2, y, { align: "center" });

  y += 15;

  // Información de la guía
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  doc.text(`Número de Guía: ${guiaCompleta.guia.numero_guia}`, margin, y);
  y += 8;
  doc.text(`Fecha: ${guiaCompleta.guia.fecha}`, margin, y);
  y += 8;
  doc.text(`Responsable: ${guiaCompleta.guia.responsable}`, margin, y);
  y += 8;

  if (guiaCompleta.guia.observaciones) {
    doc.text(`Observaciones: ${guiaCompleta.guia.observaciones}`, margin, y);
    y += 8;
  }

  y += 10;

  // Tabla de productos
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Productos", margin, y);
  y += 10;

  // Encabezados de tabla
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const colWidths = {
    codigo: 30,
    nombre: 60,
    cantidad: 25,
    unidad: 25,
    lote: 35,
  };

  let x = margin;
  doc.text("Código", x, y);
  x += colWidths.codigo;
  doc.text("Nombre", x, y);
  x += colWidths.nombre;
  doc.text("Cantidad", x, y);
  x += colWidths.cantidad;
  doc.text("Unidad", x, y);
  x += colWidths.unidad;
  doc.text("Lote", x, y);

  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Contenido de la tabla
  doc.setFont("helvetica", "normal");
  guiaCompleta.detalles.forEach((detalle) => {
    // Verificar si necesitamos nueva página
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    x = margin;
    doc.text(detalle.producto_codigo, x, y);
    x += colWidths.codigo;
    doc.text(detalle.producto_nombre.substring(0, 25), x, y);
    x += colWidths.nombre;
    doc.text(detalle.cantidad.toString(), x, y);
    x += colWidths.cantidad;
    doc.text(detalle.producto_unidad, x, y);
    x += colWidths.unidad;
    doc.text(detalle.lote, x, y);

    y += 8;
  });

  y += 10;
  doc.line(margin, y, pageWidth - margin, y);

  // Total de productos
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text(`Total de productos: ${guiaCompleta.detalles.length}`, margin, y);

  // Pie de página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );
    doc.text(
      `Generado: ${new Date().toLocaleString("es-ES")}`,
      pageWidth - margin,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" },
    );
  }

  return doc;
};


export const previsualizarPDF = (guiaCompleta) => {
  const doc = generarPDFGuia(guiaCompleta);
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");
};


export const descargarPDF = (guiaCompleta) => {
  const doc = generarPDFGuia(guiaCompleta);
  doc.save(`guia_${guiaCompleta.guia.numero_guia}.pdf`);
};


export const imprimirPDF = (guiaCompleta) => {
  const doc = generarPDFGuia(guiaCompleta);
  doc.autoPrint();
  const pdfBlob = doc.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 100);
  };
};
