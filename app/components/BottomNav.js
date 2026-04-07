"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    {
        name: "Inicio", icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ), href: "/"
    },
    {
        name: "Promos", icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.76 3.76a2 2 0 012.83 0l4.65 4.65a2 2 0 010 2.83l-9.58 9.58a2 2 0 01-2.83 0l-4.65-4.58a2 2 0 010-2.83l9.58-9.65zM11.5 8.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        ), href: "/admin"
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 md:hidden animate-entrance">
            <nav className="glass-effect rounded-3xl p-2 flex justify-around items-center border border-white/20 shadow-2xl">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 px-6 py-2 rounded-2xl ${isActive
                                ? "bg-mercurio-navy text-white scale-110 shadow-lg"
                                : "text-slate-400 hover:text-mercurio-navy"
                                }`}
                        >
                            <div className="relative">
                                {item.icon}
                                {isActive && (
                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mercurio-pink opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-mercurio-pink"></span>
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

