"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Promociones", href: "/admin" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="glass-nav h-20 flex items-center px-4 md:px-8 sticky top-0 z-50 transition-all duration-300">
            <div className="flex items-center gap-4 flex-1 md:flex-none">
                <Link href="/" className="text-white p-2 md:hidden hover:bg-white/10 rounded-full transition-colors">
                    <svg
                        className="w-6 h-6"
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
                </Link>

                <Link href="/" className="flex flex-col items-center md:items-start justify-center group">
                    <div className="text-white font-black italic text-2xl md:text-3xl leading-none group-hover:scale-105 transition-transform duration-300">
                        mercurio
                    </div>
                    <div className="text-[8px] md:text-[10px] text-white/90 uppercase tracking-[0.2em] font-black">
                        pinturerías
                    </div>
                    <div className="w-full h-[3px] mercurio-gradient-wave mt-1 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-end items-center gap-10 ml-10">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-black uppercase tracking-widest transition-all duration-300 relative py-2 group ${isActive ? "text-mercurio-yellow" : "text-white/80 hover:text-white"
                                }`}
                        >
                            {item.name}
                            <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-mercurio-yellow transition-transform duration-300 origin-right scale-x-0 group-hover:scale-x-100 group-hover:origin-left ${isActive ? "scale-x-100" : ""}`} />
                        </Link>
                    );
                })}
            </nav>

            <div className="w-10 h-10 md:hidden" /> {/* Spacer only for mobile centering */}
        </header>
    );
}

