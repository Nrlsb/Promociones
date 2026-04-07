import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
    const { data, error } = await supabase
        .from("stats")
        .select("count")
        .eq("id", "visits")
        .single();

    if (error) {
        // Si la tabla no existe o hay error, devolvemos 0 por ahora
        return Response.json({ count: 0 });
    }

    return Response.json(data);
}

export async function POST() {
    // Usamos una función RPC de Supabase para incrementar atómicamente con el cliente admin
    const { error } = await supabaseAdmin.rpc("increment_visits");

    if (error) {
        // Si el RPC falla (p.ej. no existe), intentamos un update normal con admin
        const { data: current } = await supabaseAdmin
            .from("stats")
            .select("count")
            .eq("id", "visits")
            .single();

        const newCount = (current?.count || 0) + 1;

        const { error: updateError } = await supabaseAdmin
            .from("stats")
            .update({ count: newCount })
            .eq("id", "visits");

        if (updateError) {
            return Response.json({ error: updateError.message }, { status: 500 });
        }
    }

    return Response.json({ success: true });
}
