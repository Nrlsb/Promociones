import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-mercurio-navy text-white pt-12 pb-24 md:pb-12 mt-20">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex flex-col">
                            <div className="text-white font-black italic text-2xl leading-none">
                                mercurio
                            </div>
                            <div className="text-[10px] text-white/80 uppercase tracking-widest font-bold">
                                pinturerías
                            </div>
                            <div className="w-24 h-[2px] mercurio-gradient-wave mt-1 rounded-full" />
                        </Link>
                        <p className="text-white/60 text-sm max-w-xs">
                            Expertos en color y protección para tu hogar. Las mejores promociones en un solo lugar.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-tight text-mercurio-yellow">Navegación</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition-colors">Administrar Promos</Link></li>
                        </ul>
                    </div>

                    {/* Legal/Contact placeholder */}
                    <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-tight text-mercurio-yellow">Contacto</h4>
                        <p className="text-sm text-white/70">
                            ¿Necesitás ayuda? Contactanos a través de nuestras redes sociales o visitanos en nuestras sucursales.
                        </p>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                    <p>© {new Date().getFullYear()} Mercurio Pinturerías. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-white transition-colors">Términos</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Privacidad</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
