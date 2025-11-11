import React, { useState } from "react";
import { uploadDocumento } from "../../Services/uploadService";

export default function UploadDocumento({ proyectoId, onUploaded, onClose }: { proyectoId: string; onUploaded?: () => void; onClose?: () => void; }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // validar PDF
    if (f.type !== "application/pdf") {
      alert("Por favor selecciona un archivo PDF.");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return alert("Selecciona un archivo primero.");
    setUploading(true);
    setProgress(0);
    try {
      const resp = await uploadDocumento(proyectoId, file, (p) => setProgress(p));
      console.log("Upload response:", resp);
      alert("Documento subido correctamente.");
      if (onUploaded) onUploaded();
      if (onClose) onClose();
    } catch (err: any) {
      console.error("Error subiendo documento:", err);
      alert("Error subiendo documento: " + (err?.message || String(err)));
    } finally {
      setUploading(false);
      setProgress(0);
      setFile(null);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar PDF</label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      {uploading && (
        <div className="mb-3">
          <div className="text-sm">Subiendo: {progress}%</div>
          <div className="w-full bg-gray-200 rounded h-2 mt-1">
            <div className="bg-indigo-600 h-2 rounded" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1 rounded border">Cancelar</button>
        <button onClick={handleSubmit} disabled={uploading || !file} className="px-3 py-1 rounded bg-indigo-600 text-white">
          {uploading ? "Subiendo..." : "Subir"}
        </button>
      </div>
    </div>
  );
}
