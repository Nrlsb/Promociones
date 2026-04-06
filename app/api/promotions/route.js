import { supabase } from "@/lib/supabase";

const BUCKET = "promotions";

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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID requerido." }, { status: 400 });
  }

  const { data: promo, error: fetchError } = await supabase
    .from("promotions")
    .select("filename")
    .eq("id", id)
    .single();

  if (fetchError || !promo) {
    return Response.json({ error: "Promoción no encontrada." }, { status: 404 });
  }

  await supabase.storage.from(BUCKET).remove([promo.filename]);

  const { error: deleteError } = await supabase
    .from("promotions")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
