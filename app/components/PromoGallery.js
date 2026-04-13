"use client";

import { useState } from "react";
import Image from "next/image";

export default function PromoGallery({ promotions, onDelete, isAdmin = false }) {
  const [deleting, setDeleting] = useState(null);

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

  if (!Array.isArray(promotions) || !promotions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-entrance">
        <div className="w-24 h-24 mb-6 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
          <svg
            className="w-12 h-12 opacity-30"
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
        </div>
        <p className="text-2xl font-black text-slate-800 italic">Sin promociones</p>
        <p className="text-sm mt-2 text-slate-500 font-medium">Pronto tendremos nuevas ofertas para vos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-black text-slate-900 italic tracking-tight">Galería de Ofertas</h2>
        <div className="flex-1 h-[2px] bg-slate-100 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {promotions.map((promo, index) => {
          return (
            <div
              key={promo.id}
              className="mercurio-card group animate-entrance"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <Image
                  src={promo.url}
                  alt={promo.title}
                  fill
                  className="object-contain transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index < 4}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(promo.id)}
                      disabled={deleting === promo.id}
                      className="w-10 h-10 bg-white/20 hover:bg-red-500/90 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30"
                      title="Eliminar"
                    >
                      {deleting === promo.id ? "..." : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
