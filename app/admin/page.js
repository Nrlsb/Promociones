"use client";
import { useState, useEffect, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import PromoGallery from "../components/PromoGallery";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const [promotions, setPromotions] = useState([]);
    const [stats, setStats] = useState({ count: 0 });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchPromotions = useCallback(async () => {
        try {
            const res = await fetch("/api/promotions");
            const data = await res.json();
            setPromotions(data);
        } catch {
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch("/api/stats");
            const data = await res.json();
            setStats(data);
        } catch {
            setStats({ count: 0 });
        }
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.push("/login");
        router.refresh();
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/login");
            }
        };
        checkSession();
        fetchPromotions();
        fetchStats();
    }, [fetchPromotions, fetchStats, router]);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    Panel de Promociones
                </h1>

                <div className="flex items-center gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Visitas</span>
                        <span className="text-xl font-bold text-mercurio-navy">{stats.count || 0}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Cerrar sesión"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            <UploadZone onUploadSuccess={fetchPromotions} />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-mercurio-navy rounded-full animate-spin" />
                </div>
            ) : (
                <PromoGallery
                    promotions={promotions}
                    onDelete={fetchPromotions}
                    isAdmin={true}
                />
            )}
        </div>
    );
}
