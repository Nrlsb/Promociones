import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request) {
  try {
    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return Response.json({ error: "Suscripción no válida." }, { status: 400 });
    }

    // Insertar la suscripción en la tabla push_subscriptions.
    // Si ya existe (por el constraint UNIQUE en la columna subscription),
    // el error 23505 (unique_violation) se maneja devolviendo un código 200.
    const { data, error } = await supabaseAdmin
      .from("push_subscriptions")
      .insert({ subscription })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return Response.json({ success: true, message: "Ya registrado." }, { status: 200 });
      }
      console.error("Error al registrar suscripción en la base de datos:", error);
      return Response.json({ error: "Error al guardar la suscripción en la base de datos." }, { status: 500 });
    }

    return Response.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("Error interno en POST /api/subscribe:", err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
