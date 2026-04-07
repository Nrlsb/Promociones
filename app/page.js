"use client";

import { useState, useEffect, useCallback } from "react";
import PromoGallery from "./components/PromoGallery";

export default function HomePage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions");
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      setPromotions([]);
    } finally {
      // Small delay for better feel of the loading animation
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    // Registrar visita
    fetch("/api/stats", { method: "POST" }).catch(console.error);
  }, [fetchPromotions]);

  return (
    <div className="space-y-10 py-6">
      {/* Hero-like title section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-mercurio-navy p-8 md:p-12 text-white animate-entrance">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mercurio-pink/20 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-mercurio-yellow/10 blur-[80px] rounded-full -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col gap-4">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-mercurio-yellow">
            Ofertas Exclusivas
          </span>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">
            Promociones <br /> <span className="text-white/60">Imperdibles</span>
          </h1>
          <p className="text-sm md:text-base text-white/60 max-w-md font-medium leading-relaxed mt-2">
            Descubrí las mejores oportunidades para renovar tus espacios con la calidad de Mercurio Pinturerías.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-mercurio-pink rounded-full animate-spin" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Cargando beneficios...</p>
        </div>
      ) : (
        <PromoGallery promotions={promotions} isAdmin={false} />
      )}
    </div>
  );
}

