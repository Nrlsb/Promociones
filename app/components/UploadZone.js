"use client";

import { useState, useRef, useCallback } from "react";

export default function UploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);
  const [termsFile, setTermsFile] = useState(null);
  const fileInputRef = useRef(null);
  const termsInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) addFiles(files);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) addFiles(files);
  };

  const handleTermsChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(file.type)) {
        setError("Los términos y condiciones deben ser un archivo PDF o una imagen.");
        return;
      }
      setError(null);
      setTermsFile(file);
    }
  };

  const addFiles = (files) => {
    setError(null);
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviewFiles((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index) => {
    setPreviewFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!previewFiles.length) {
      setError("Seleccioná al menos una imagen.");
      return;
    }
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const { file } of previewFiles) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title.trim());
        if (termsFile) {
          formData.append("terms", termsFile);
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Error al subir la imagen.");
        }
      }

      previewFiles.forEach((p) => URL.revokeObjectURL(p.preview));
      setPreviewFiles([]);
      setTitle("");
      setTermsFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (termsInputRef.current) termsInputRef.current.value = "";
      onUploadSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mercurio-card p-6 shadow-md border-0 mb-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Crear promoción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Título */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-2">
            Título de la promoción
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: 20% OFF en Pintura Látex"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-mercurio-navy placeholder:text-slate-400"
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group h-32 flex flex-col items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden ${isDragging
            ? "border-mercurio-navy bg-mercurio-light"
            : "border-slate-300 hover:border-mercurio-navy"
            }`}
        >
          <div className="absolute inset-x-0 bottom-0 h-8 opacity-20 mercurio-gradient-wave blur-xl" />

          <div className="flex items-center gap-3 text-mercurio-navy font-semibold z-10">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            <span className="text-lg">Subir imagen de la promoción</span>
          </div>

          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full mercurio-gradient-wave rotate-45 blur-2xl" />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full mercurio-gradient-wave -rotate-45 blur-2xl" />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Previews */}
        {previewFiles.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {previewFiles.map((p, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-slate-100 shadow-inner">
                <img
                  src={p.preview}
                  alt={p.name}
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Términos y condiciones (opcional) */}
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <label className="block text-base font-semibold text-slate-700 mb-2">
            Términos y condiciones (opcional)
          </label>
          
          {!termsFile ? (
            <div
              onClick={() => termsInputRef.current?.click()}
              className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 hover:border-mercurio-navy bg-white px-4 py-3 cursor-pointer transition-all hover:bg-slate-50"
            >
              <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700">Subir términos y condiciones</p>
                <p className="text-xs text-slate-400">Formatos permitidos: PDF o Imagen (Máx. 10MB)</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                {termsFile.type === "application/pdf" ? (
                  <svg className="w-8 h-8 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2a1 1 0 011-1h2v3a1 1 0 001 1h3v7a1 1 0 01-1 1H7a1 1 0 01-1-1V6z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="text-left overflow-hidden">
                  <p className="text-sm font-semibold text-slate-700 truncate">{termsFile.name}</p>
                  <p className="text-xs text-slate-400">{(termsFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTermsFile(null);
                  if (termsInputRef.current) termsInputRef.current.value = "";
                }}
                className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          
          <input
            ref={termsInputRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleTermsChange}
            className="hidden"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading || !previewFiles.length}
          className="mercurio-button-primary w-full py-4 text-xl shadow-lg disabled:opacity-50 disabled:active:scale-100 h-16 flex items-center justify-center"
        >
          {uploading ? (
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          ) : "Subir promoción"}
        </button>
      </form>
    </div>
  );
}
