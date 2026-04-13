"use client";

import QRCodeStyled from "@/app/components/QRCodeStyled";
import Link from "next/link";

export default function QRPage() {
    return (
        <main className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ffd700] rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#e21b5a] rounded-full blur-[120px] opacity-20"></div>
            </div>

            <div className="max-w-md w-full animate-entrance text-center space-y-10 relative z-10">
                <div className="space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-[#162d5f]/10 text-[#162d5f] rounded-full text-xs font-bold tracking-widest uppercase">
                        Acceso Exclusivo
                    </div>
                    <h1 className="text-5xl font-black text-[#162d5f] tracking-tight leading-none">
                        TU ACCESO <span className="text-[#e21b5a]">DIRECTO</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed px-4">
                        Escanea para descubrir promociones que no vas a querer perderte.
                    </p>
                </div>

                <div className="flex justify-center flex-col items-center gap-6">
                    <QRCodeStyled />

                    <div className="flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tighter">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        ESCANEA PARA INGRESAR
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <Link
                        href="/"
                        className="mercurio-button-primary w-full py-5 text-xl font-black tracking-wide"
                    >
                        VOLVER AL INICIO
                    </Link>

                    <button
                        onClick={() => window.location.reload()}
                        className="text-[#162d5f] font-bold text-sm hover:underline underline-offset-4 decoration-2"
                    >
                        ¿Problemas al cargar? Recargar página
                    </button>
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Pinturerías Mercurio · 2024
                </p>
            </div>
        </main>
    );
}
