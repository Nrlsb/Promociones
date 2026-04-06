"use client";

import { useState } from "react";
import Image from "next/image";

export default function PromoGallery({ promotions, onDelete }) {
  const [deleting, setDeleting] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
      if (res.ok) onDelete?.();
    } finally {
      setDeleting(null);
    }
  };

  if (!promotions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg
          className="w-16 h-16 mb-4 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-lg font-medium">Todavía no hay promociones</p>
        <p className="text-sm mt-1">Subí la primera imagen usando el formulario</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="relative aspect-video bg-gray-100 cursor-zoom-in"
              onClick={() => setLightbox(promo)}
            >
              <Image
                src={promo.url}
                alt={promo.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 truncate">{promo.title}</h3>
              {promo.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {promo.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {new Date(promo.createdAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button
                  onClick={() => handleDelete(promo.id)}
                  disabled={deleting === promo.id}
                  className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors font-medium"
                >
                  {deleting === promo.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.title}
              className="w-full h-auto rounded-xl max-h-[80vh] object-contain"
            />
            <div className="mt-3 text-white">
              <p className="font-semibold text-lg">{lightbox.title}</p>
              {lightbox.description && (
                <p className="text-sm text-gray-300 mt-1">{lightbox.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
