import QRCodeStyled from "@/app/components/QRCodeStyled";
import Link from "next/link";

export const metadata = {
    title: "Código QR - Mercurio Promociones",
    description: "Escanea para acceder a las promociones exclusivas de Mercurio.",
};

export default function QRPage() {
    return (
        <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full animate-entrance text-center space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-[#162d5f]">
                        Tu Acceso Directo
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Escanea este código para ingresar a nuestra web de promociones
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd700] via-[#e21b5a] to-[#162d5f] rounded-[3rem] opacity-20 blur-2xl group-hover:opacity-40 transition duration-1000"></div>
                    <QRCodeStyled />
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="mercurio-button-primary w-full py-4 text-lg"
                    >
                        Volver al Inicio
                    </Link>
                </div>

                <p className="text-xs text-slate-400">
                    © 2024 Mercurio - Todos los derechos reservados
                </p>
            </div>
        </main>
    );
}
