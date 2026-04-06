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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Agregar promoción
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: 30% OFF en electrónica"
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detallá la promoción..."
            rows={2}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
          }`}
        >
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-blue-600">
              Hacé click para seleccionar
            </span>{" "}
            o arrastrá imágenes aquí
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WEBP — máx. 10 MB</p>
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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previewFiles.map((p, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                <img
                  src={p.preview}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading || !previewFiles.length}
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Subiendo..." : `Subir${previewFiles.length > 1 ? ` ${previewFiles.length} imágenes` : " imagen"}`}
        </button>
      </form>
    </div>
  );
}
