import { useState } from "react";
import { Printer } from "lucide-react";
import "./PrintButton.css";

export default function PrintButton({
  data,
  id,
  obtenerPorId,
  generarHtml,
  title = "Imprimir",
}) {
  const [cargando, setCargando] = useState(false);

  const imprimir = (item) => {
    const html = generarHtml(item);

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;top:0;left:0;width:0;height:0;border:none;visibility:hidden";
    document.body.appendChild(iframe);

    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      iframe.contentWindow.onafterprint = () => {
        document.body.removeChild(iframe);
      };
    };
  };

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (data) {
      imprimir(data);
      return;
    }
    try {
      setCargando(true);
      const item = await obtenerPorId(id);
      imprimir(item);
    } catch (err) {
      console.error("Error cargando datos para impresión:", err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={cargando}
      className="print-button"
      title={title}
    >
      <Printer size={15} />
    </button>
  );
}
