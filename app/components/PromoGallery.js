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

  if (!promotions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg
          className="w-16 h-16 mb-4 opacity-20"
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
        <p className="text-xl font-bold">Sin promociones</p>
        <p className="text-sm mt-1">Todavía no hay ofertas para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-2xl font-bold text-slate-800">Galería de promociones</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {promotions.map((promo, index) => {
          // Mocking status for visual fidelity based on index
          const isActive = index % 2 === 0;

          return (
            <div
              key={promo.id}
              className="mercurio-card shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <Image
                  src={promo.url}
                  alt={promo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />

                {/* Wave overlay like in image cards */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-24 h-4 mercurio-gradient-wave opacity-80 rounded-tl-full blur-[2px]" />
              </div>

              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {promo.title}
                </h3>

                <p className="text-sm text-slate-500 font-medium">
                  {promo.description || "Sin descripción detallada"}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {isActive ? "Activa" : "Finalizada"}
                  </span>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(promo.id)}
                      disabled={deleting === promo.id}
                      className="text-xs text-red-400 hover:text-red-600 font-bold p-2 transition-colors"
                    >
                      {deleting === promo.id ? "..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
