import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BUCKET = "promotions";

async function getUser(request) {
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function GET() {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json(data);
}

export async function DELETE(request) {
  const user = await getUser(request);
  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID requerido." }, { status: 400 });
  }

  const { data: promo, error: fetchError } = await supabaseAdmin
    .from("promotions")
    .select("filename")
    .eq("id", id)
    .single();

  if (fetchError || !promo) {
    return Response.json({ error: "Promoción no encontrada." }, { status: 404 });
  }

  await supabaseAdmin.storage.from(BUCKET).remove([promo.filename]);

  const { error: deleteError } = await supabaseAdmin
    .from("promotions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function PATCH(request) {
  const user = await getUser(request);
  if (!user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const { id, title } = await request.json();

    if (!id || !title) {
      return Response.json({ error: "ID y título son requeridos." }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("promotions")
      .update({ title: title.trim() })
      .eq("id", id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Error al procesar la solicitud." }, { status: 400 });
  }
}
