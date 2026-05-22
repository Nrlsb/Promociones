import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
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

    // Asegurar que el bucket existe usando el cliente admin y acepta imágenes y PDFs
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const existingBucket = buckets?.find(b => b.name === BUCKET);
    if (!existingBucket) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes,
        fileSizeLimit: MAX_SIZE
      });
      if (bucketError) {
        console.error("Error al crear bucket:", bucketError);
      }
    } else {
      // Actualizar el bucket existente para asegurarse de que admita PDFs e imágenes
      const { error: updateBucketError } = await supabaseAdmin.storage.updateBucket(BUCKET, {
        public: true,
        allowedMimeTypes,
        fileSizeLimit: MAX_SIZE
      });
      if (updateBucketError) {
        console.error("Error al actualizar bucket:", updateBucketError);
      }
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: image.type,
        upsert: true
      });

    if (uploadError) {
      console.error("Error de carga en storage:", uploadError);
      return Response.json({ error: `Error al subir la imagen: ${uploadError.message}` }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    // Procesar términos y condiciones opcionales
    const terms = formData.get("terms");
    let termsUrl = null;
    let termsFilename = null;

    if (terms && typeof terms !== "string" && terms.size > 0) {
      if (!allowedMimeTypes.includes(terms.type)) {
        return Response.json({ error: "El archivo de términos debe ser una imagen o PDF." }, { status: 400 });
      }

      const termsBuffer = Buffer.from(await terms.arrayBuffer());
      if (termsBuffer.byteLength > MAX_SIZE) {
        return Response.json({ error: "El archivo de términos supera el límite de 10 MB." }, { status: 400 });
      }

      const termsExt = terms.name.split(".").pop().toLowerCase();
      termsFilename = `terms-${randomUUID()}.${termsExt}`;

      const { error: termsUploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(termsFilename, termsBuffer, {
          contentType: terms.type,
          upsert: true
        });

      if (termsUploadError) {
        console.error("Error al subir los términos a storage:", termsUploadError);
        return Response.json({ error: `Error al subir los términos: ${termsUploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl: tUrl } } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(termsFilename);
      
      termsUrl = tUrl;
    }

    const { data: promo, error: dbError } = await supabaseAdmin
      .from("promotions")
      .insert({ 
        title, 
        description, 
        url: publicUrl, 
        filename,
        terms_url: termsUrl,
        terms_filename: termsFilename
      })
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
