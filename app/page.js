"use client";

import { useState, useEffect, useCallback } from "react";
import UploadZone from "./components/UploadZone";
import PromoGallery from "./components/PromoGallery";

export default function HomePage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch("/api/promotions");
      const data = await res.json();
      setPromotions(data);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Mis Promociones
            </h1>
            <p className="text-xs text-gray-500">
              {promotions.length}{" "}
              {promotions.length === 1 ? "promoción activa" : "promociones activas"}
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            Panel de promociones
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Mostrá tus ofertas al mundo
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Subí imágenes de tus promociones, descuentos y ofertas especiales para
            mantener a tus clientes siempre informados.
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <UploadZone onUploadSuccess={fetchPromotions} />
            </div>
          </div>

          {/* Gallery */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Galería de promociones
              </h2>
              {promotions.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">
                  {promotions.length} {promotions.length === 1 ? "ítem" : "ítems"}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : (
              <PromoGallery
                promotions={promotions}
                onDelete={fetchPromotions}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-6 text-center text-sm text-gray-400">
        Panel de promociones &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
