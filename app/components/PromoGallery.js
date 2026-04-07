"use client";

import { useState } from "react";
import Image from "next/image";

export default function PromoGallery({ promotions, onDelete, isAdmin = false }) {
  const [deleting, setDeleting] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const startEditing = (promo) => {
    setEditingId(promo.id);
    setEditTitle(promo.title);
  };

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title: editTitle }),
      });
      if (res.ok) {
        setEditingId(null);
        onDelete?.(); // Refresca la lista
      }
    } finally {
      setUpdating(false);
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
          const isActive = index % 2 === 0;

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
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority={index < 4}
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-lg backdrop-blur-md border border-white/20 ${isActive
                    ? "bg-green-500/80 text-white"
                    : "bg-mercurio-pink/80 text-white"
                    }`}>
                    {isActive ? "✨ Activa" : "Finalizada"}
                  </span>
                </div>

                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => startEditing(promo)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all duration-300 border border-white/30"
                      title="Editar título"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
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

              <div className="p-6 bg-white flex flex-col gap-3">
                {editingId === promo.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-mercurio-navy"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-1 bg-mercurio-navy text-white py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {updating ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 bg-slate-100 text-slate-600 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 className="text-xl font-black text-slate-900 leading-none group-hover:text-mercurio-navy transition-colors">
                    {promo.title}
                  </h3>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
