"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("Intentando iniciar sesión para:", email);

        try {
            const { data, error: sbError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("Respuesta de Supabase:", { data, error: sbError });

            if (sbError) throw sbError;

            if (!data.session) {
                throw new Error("No se pudo establecer una sesión. Por favor, verifica tu correo.");
            }

            // Guardar token en cookie para el middleware
            document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

            console.log("Inicio de sesión exitoso, redirigiendo...");
            router.push("/admin");
            router.refresh();
        } catch (err) {
            console.error("Error en handleLogin:", err);

            let errorMessage = err.message || "Ocurrió un error inesperado";

            // Traducciones comunes
            if (errorMessage === "Invalid login credentials") {
                errorMessage = "Credenciales inválidas. Revisa tu email y contraseña.";
            } else if (errorMessage === "Email not confirmed") {
                errorMessage = "Debes confirmar tu correo electrónico antes de ingresar.";
            } else if (err.status === 400 && !err.message) {
                errorMessage = "Error de solicitud: Credenciales incorrectas o campos vacíos.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                    Acceso Administrador
                </h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mercurio-navy focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mercurio-navy focus:border-transparent outline-none transition-all"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Iniciando sesión..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
