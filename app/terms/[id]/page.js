import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TermsPage({ params }) {
  const { id } = await params;

  // Consultar la promoción en Supabase
  const { data: promo, error } = await supabase
    .from("promotions")
    .select("title, terms, url")
    .eq("id", id)
    .single();

  if (error || !promo || !promo.terms) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-entrance">
      {/* Botón Volver */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-mercurio-navy transition-colors mb-6 group"
      >
        <svg
          className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Volver a las promociones</span>
      </Link>

      {/* Tarjeta de bases y condiciones */}
      <div className="mercurio-card bg-white p-8 md:p-10 shadow-xl border border-slate-100/50">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-mercurio-pink block mb-3">
          Legales y Bases
        </span>
        
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-6 italic tracking-tight">
          {promo.title}
        </h1>

        <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 via-slate-200 to-transparent rounded-full mb-8" />

        {/* Contenido de los términos */}
        <div 
          className="text-slate-600 text-base md:text-lg leading-relaxed font-medium tracking-wide terms-content"
          dangerouslySetInnerHTML={{ __html: promo.terms }}
        />

        {/* Decoración inferior */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Mercurio Pinturerías</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
