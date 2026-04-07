"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {
        name: "Inicio", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ), href: "/"
    },
    {
        name: "Promociones", icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.76 3.76a2 2 0 012.83 0l4.65 4.65a2 2 0 010 2.83l-9.58 9.58a2 2 0 01-2.83 0l-4.65-4.58a2 2 0 010-2.83l9.58-9.65zM11.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        ), href: "/admin"
    }, // Mostrando admin para desarrollo/demo, luego ajustamos
    {
        name: "Tiendas", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ), href: "#"
    },
    {
        name: "Perfil", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ), href: "#"
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 md:hidden">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 transition-colors ${isActive ? "text-mercurio-navy" : "text-gray-400"
                            }`}
                    >
                        <div className={isActive ? "text-mercurio-navy" : "text-gray-300"}>
                            {item.icon}
                        </div>
                        <span className="text-[10px] font-medium">{item.name}</span>
                        {isActive && (
                            <div className="absolute bottom-0 w-8 h-1 bg-mercurio-navy rounded-t-full" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
