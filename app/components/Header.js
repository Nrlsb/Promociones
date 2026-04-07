"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { name: "Inicio", href: "/" },
    { name: "Promociones", href: "/admin" },
    { name: "Tiendas", href: "#" },
    { name: "Perfil", href: "#" },
];

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="bg-mercurio-navy h-16 flex items-center px-4 md:px-8 sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1 md:flex-none">
                <Link href="/" className="text-white p-2 md:hidden">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </Link>

                <Link href="/" className="flex flex-col items-center md:items-start justify-center">
                    <div className="text-white font-black italic text-xl md:text-2xl leading-none">
                        mercurio
                    </div>
                    <div className="text-[8px] md:text-[10px] text-white/80 uppercase tracking-widest font-bold">
                        pinturerías
                    </div>
                    <div className="w-full h-[2px] mercurio-gradient-wave mt-1 rounded-full" />
                </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-end items-center gap-8 ml-10">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`text-sm font-bold uppercase tracking-wider transition-colors hover:text-mercurio-yellow ${isActive ? "text-mercurio-yellow" : "text-white"
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="w-10 h-10 md:hidden" /> {/* Spacer only for mobile centering */}
        </header>
    );
}
