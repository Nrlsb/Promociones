import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024;
const BUCKET = "promotions";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim() || "";

    if (!image || typeof image === "string") {
      return Response.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
    }
    if (!title) {
      return Response.json({ error: "El título es obligatorio." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image.type)) {
      return Response.json({ error: "Tipo de archivo no permitido." }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    if (buffer.byteLength > MAX_SIZE) {
      return Response.json({ error: "La imagen supera el límite de 10 MB." }, { status: 400 });
    }

    const ext = image.name.split(".").pop().toLowerCase();
    const filename = `${randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: image.type });

    if (uploadError) {
      console.error(uploadError);
      return Response.json({ error: "Error al subir la imagen." }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    const { data: promo, error: dbError } = await supabase
      .from("promotions")
      .insert({ title, description, url: publicUrl, filename })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      return Response.json({ error: "Error al guardar en la base de datos." }, { status: 500 });
    }

    return Response.json(promo, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
