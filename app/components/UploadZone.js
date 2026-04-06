"use client";

import { useState, useRef, useCallback } from "react";

export default function UploadZone({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewFiles, setPreviewFiles] = useState([]);
  const fileInputRef = useRef(null);

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
        formData.append("description", description.trim());

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
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
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

        {/* Descripción */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-2">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detallá tu oferta especial"
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
          {/* Wave Background logic in CSS would be complex, using a simple gradient overlay for now */}
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

          {/* Actual wave design as seen in image */}
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
                  className="w-full h-full object-cover"
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
