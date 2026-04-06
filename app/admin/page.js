"use client";

import { useState, useEffect, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import PromoGallery from "../components/PromoGallery";

export default function AdminPage() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    return (
        <div className="space-y-8 pb-10">
            {/* Admin Title */}
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Panel de Promociones
            </h1>

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
