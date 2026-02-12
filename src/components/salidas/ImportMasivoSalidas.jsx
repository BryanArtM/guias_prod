import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button, Alert } from "@/components/common";
import { crearSalidasBatch } from "@/services";
import "../ingresos/ImportMasivoIngresos.css";

/**
 * Componente para importación masiva de salidas desde CSV
 * Formato esperado: variante_id,tipo_salida_id,fecha,kg,cajas,observaciones
 */
export default function ImportMasivoSalidas({ onSuccess }) {
  const [archivo, setArchivo] = useState(null);
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [errores, setErrores] = useState([]);
  const fileInputRef = useRef(null);

  const handleArchivoSeleccionado = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setResultado({
          tipo: "error",
          mensaje: "Por favor selecciona un archivo CSV",
        });
        return;
      }
      setArchivo(file);
      setResultado(null);
      setErrores([]);
    }
  };

  const parsearCSV = (texto) => {
    const lineas = texto.split("\n");
    const salidas = [];
    const erroresValidacion = [];

    for (let i = 1; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (!linea) continue;

      const campos = linea.split(",");

      if (campos.length < 5) {
        erroresValidacion.push({
          linea: i + 1,
          mensaje: "Cantidad de campos inválida (mínimo 5)",
        });
        continue;
      }

      const [varianteId, tipoSalidaId, fecha, kg, cajas, ...obs] = campos;

      const varianteIdNum = parseInt(varianteId);
      const tipoSalidaIdNum = parseInt(tipoSalidaId);
      const kgNum = parseFloat(kg);
      const cajasNum = parseInt(cajas);

      if (isNaN(varianteIdNum)) {
        erroresValidacion.push({
          linea: i + 1,
          mensaje: `variante_id inválido: "${varianteId}"`,
        });
        continue;
      }

      if (isNaN(tipoSalidaIdNum)) {
        erroresValidacion.push({
          linea: i + 1,
          mensaje: `tipo_salida_id inválido: "${tipoSalidaId}"`,
        });
        continue;
      }

      if (isNaN(kgNum)) {
        erroresValidacion.push({
          linea: i + 1,
          mensaje: `kg inválido: "${kg}"`,
        });
        continue;
      }

      if (isNaN(cajasNum)) {
        erroresValidacion.push({
          linea: i + 1,
          mensaje: `cajas inválido: "${cajas}"`,
        });
        continue;
      }

      salidas.push({
        variante_id: varianteIdNum,
        tipo_salida_id: tipoSalidaIdNum,
        fecha: fecha.trim(),
        kg: kgNum,
        cajas: cajasNum,
        observaciones: obs.join(",").trim() || undefined,
      });
    }

    return { salidas, errores: erroresValidacion };
  };

  const handleImportar = async () => {
    if (!archivo) return;

    setImportando(true);
    setProgreso(0);
    setResultado(null);
    setErrores([]);

    try {
      const texto = await archivo.text();
      const { salidas, errores: erroresValidacion } = parsearCSV(texto);

      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        setResultado({
          tipo: "error",
          mensaje: `Se encontraron ${erroresValidacion.length} errores de validación`,
        });
        setImportando(false);
        return;
      }

      if (salidas.length === 0) {
        setResultado({
          tipo: "error",
          mensaje: "No se encontraron registros válidos en el archivo",
        });
        setImportando(false);
        return;
      }

      const BATCH_SIZE = 100;
      let totalImportados = 0;

      for (let i = 0; i < salidas.length; i += BATCH_SIZE) {
        const batch = salidas.slice(i, i + BATCH_SIZE);
        await crearSalidasBatch(batch);
        totalImportados += batch.length;
        setProgreso(Math.round((totalImportados / salidas.length) * 100));
      }

      setResultado({
        tipo: "success",
        mensaje: `✅ ${totalImportados} registros importados exitosamente`,
      });

      setArchivo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (error) {
      console.error("Error en importación:", error);
      setResultado({
        tipo: "error",
        mensaje: `❌ Error: ${error.message || error}`,
      });
    } finally {
      setImportando(false);
      setProgreso(0);
    }
  };

  const limpiar = () => {
    setArchivo(null);
    setResultado(null);
    setErrores([]);
    setProgreso(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="import-masivo-container">
      <div className="import-header">
        <Upload className="import-icon" size={24} />
        <h3>Importación Masiva de Salidas</h3>
      </div>

      <div className="import-info">
        <p className="import-info-text">
          Formato CSV esperado:{" "}
          <code>variante_id,tipo_salida_id,fecha,kg,cajas,observaciones</code>
        </p>
        <p className="import-info-example">
          Ejemplo: <code>1,2,2024-02-10,150.5,20,Guía ABC123</code>
        </p>
      </div>

      <div className="import-file-selector">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleArchivoSeleccionado}
          disabled={importando}
          id="csv-file-input-salidas"
          className="import-file-input"
        />
        <label htmlFor="csv-file-input-salidas" className="import-file-label">
          <FileText size={20} />
          {archivo ? archivo.name : "Seleccionar archivo CSV"}
        </label>

        {archivo && !importando && (
          <button
            onClick={limpiar}
            className="import-clear-btn"
            title="Limpiar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="import-actions">
        <Button
          onClick={handleImportar}
          disabled={!archivo || importando}
          variant="primary"
          fullWidth
        >
          {importando ? `Importando... ${progreso}%` : "Importar Registros"}
        </Button>
      </div>

      {importando && (
        <div className="import-progress-container">
          <div className="import-progress-bar">
            <div
              className="import-progress-fill"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="import-progress-text">{progreso}%</p>
        </div>
      )}

      {resultado && (
        <Alert type={resultado.tipo} className="import-alert">
          {resultado.tipo === "success" ? (
            <div className="import-result-success">
              <CheckCircle size={20} />
              <span>{resultado.mensaje}</span>
            </div>
          ) : (
            <div className="import-result-error">
              <AlertCircle size={20} />
              <span>{resultado.mensaje}</span>
            </div>
          )}
        </Alert>
      )}

      {errores.length > 0 && (
        <div className="import-errors">
          <h4 className="import-errors-title">
            <AlertCircle size={18} />
            Errores de Validación ({errores.length})
          </h4>
          <div className="import-errors-list">
            {errores.slice(0, 10).map((error, idx) => (
              <div key={idx} className="import-error-item">
                <span className="import-error-line">Línea {error.linea}:</span>
                <span className="import-error-msg">{error.mensaje}</span>
              </div>
            ))}
            {errores.length > 10 && (
              <p className="import-errors-more">
                ... y {errores.length - 10} errores más
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
