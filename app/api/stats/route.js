import { supabase } from "@/lib/supabase";

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
    // Usamos una función RPC de Supabase para incrementar atómicamente
    const { error } = await supabase.rpc("increment_visits");

    if (error) {
        // Si el RPC falla (p.ej. no existe), intentamos un update normal
        const { data: current } = await supabase
            .from("stats")
            .select("count")
            .eq("id", "visits")
            .single();

        const newCount = (current?.count || 0) + 1;

        const { error: updateError } = await supabase
            .from("stats")
            .update({ count: newCount })
            .eq("id", "visits");

        if (updateError) {
            return Response.json({ error: updateError.message }, { status: 500 });
        }
    }

    return Response.json({ success: true });
}
