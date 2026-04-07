import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white pt-20 pb-32 md:pb-16 mt-20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 mercurio-gradient-wave" />

            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-1 space-y-6">
                        <Link href="/" className="flex flex-col group">
                            <div className="text-white font-black italic text-3xl leading-none group-hover:scale-105 transition-transform duration-300">
                                mercurio
                            </div>
                            <div className="text-[10px] text-white/70 uppercase tracking-[0.3em] font-black">
                                pinturerías
                            </div>
                            <div className="w-20 h-[3px] mercurio-gradient-wave mt-2 rounded-full" />
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                            Expertos en color y protección. Transformamos tus espacios con la mejor tecnología y estilo.
                        </p>
                    </div>

                    {/* Links 1 */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-mercurio-yellow">Explorar</h4>
                        <ul className="space-y-3 text-sm font-bold text-white/60">
                            <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition-colors">Promociones</Link></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-mercurio-yellow">Contacto</h4>
                        <ul className="space-y-3 text-sm font-bold text-white/60">
                            <li className="flex items-center gap-2">
                                <span className="text-mercurio-pink">📍</span> Casa Central
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-mercurio-pink">📞</span> 0800-COLOR
                            </li>
                        </ul>
                    </div>

                    {/* Social/Newsletter placeholder */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-mercurio-yellow">Seguinos</h4>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-mercurio-pink transition-colors cursor-pointer border border-white/10">
                                <span className="text-lg">f</span>
                            </div>
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-mercurio-pink transition-colors cursor-pointer border border-white/10">
                                <span className="text-lg">ig</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <p>© {new Date().getFullYear()} Mercurio Pinturerías. Powered by Premium Experience.</p>
                    <div className="flex gap-8">
                        <span className="cursor-pointer hover:text-white transition-colors">Términos y Condiciones</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Política de Privacidad</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

