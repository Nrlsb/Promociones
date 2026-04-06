"use client";

import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-mercurio-navy h-16 flex items-center px-4 sticky top-0 z-50">
            <Link href="/" className="text-white p-2">
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

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-white font-black italic text-xl leading-none">
                    mercurio
                </div>
                <div className="text-[8px] text-white/80 uppercase tracking-widest font-bold">
                    pinturerías
                </div>
                <div className="w-12 h-[2px] mercurio-gradient-wave mt-1 rounded-full" />
            </div>

            <div className="w-10 h-10" /> {/* Spacer */}
        </header>
    );
}
