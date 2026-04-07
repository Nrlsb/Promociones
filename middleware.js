import { NextResponse } from "next/server";

export async function middleware(req) {
    const res = NextResponse.next();
    // Este es un middleware simple para proteger /admin
    // Nota: Idealmente se usaría @supabase/auth-helpers-nextjs o @supabase/ssr
    // pero como no están en package.json, intentaremos usar el cliente normal o
    // simplemente verificar la cookie de sesión si es posible.

    // Por ahora, como es una app simple, dejaré el esqueleto y añadiré el login.
    // Si el usuario no está en /login y no tiene sesión, redirigir.

    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
        const sessionStr = req.cookies.get("sb-access-token");
        if (!sessionStr) {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    return res;
}

export const config = {
    matcher: ["/admin/:path*"],
};
