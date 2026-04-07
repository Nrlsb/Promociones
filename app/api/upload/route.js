import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024;
const BUCKET = "promotions";

export async function POST(request) {
  const token = request.cookies.get("sb-access-token")?.value;
  if (!token) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image");
    const title = formData.get("title")?.toString().trim();
    const description = ""; // Se ignora la descripción según requerimiento

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

    // Asegurar que el bucket existe (si no existe, lo crea)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === BUCKET)) {
      const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: MAX_SIZE
      });
      if (bucketError) {
        console.error("Error al crear bucket:", bucketError);
        // Continuamos de todos modos por si ya existe pero listBuckets falló por permisos
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: image.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Error de carga en storage:", uploadError);
      return Response.json({ error: `Error al subir la imagen: ${uploadError.message}` }, { status: 500 });
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
