import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

const BUCKET = "promotions";
const MAX_SIZE = 10 * 1024 * 1024;

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
    const formData = await request.formData();
    const id = formData.get("id")?.toString();
    const title = formData.get("title")?.toString().trim();
    const terms = formData.get("terms")?.toString().trim() || null;
    const installments = formData.get("installments")?.toString().trim() || null;

    let payment_methods = [];
    const paymentMethodsRaw = formData.get("payment_methods");
    if (paymentMethodsRaw) {
      try {
        payment_methods = JSON.parse(paymentMethodsRaw);
      } catch (e) {
        console.error("Error parsing payment_methods:", e);
      }
    }

    if (!id) {
      return Response.json({ error: "El ID es requerido." }, { status: 400 });
    }
    if (!title) {
      return Response.json({ error: "El título es obligatorio." }, { status: 400 });
    }

    // Check if there is an image to update
    const image = formData.get("image");
    let updateFields = {
      title,
      terms,
      payment_methods,
      installments
    };

    if (image && typeof image !== "string" && image.size > 0) {
      // Fetch old promo to delete the old image later
      const { data: oldPromo, error: fetchError } = await supabaseAdmin
        .from("promotions")
        .select("filename")
        .eq("id", id)
        .single();

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

      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(filename, buffer, {
          contentType: image.type,
          upsert: true
        });

      if (uploadError) {
        return Response.json({ error: `Error al subir la imagen: ${uploadError.message}` }, { status: 500 });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filename);

      updateFields.url = publicUrl;
      updateFields.filename = filename;

      // Delete old image if it exists
      if (oldPromo?.filename) {
        await supabaseAdmin.storage.from(BUCKET).remove([oldPromo.filename]);
      }
    }

    const { data: updatedPromo, error: updateError } = await supabaseAdmin
      .from("promotions")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      return Response.json({ error: "Error al actualizar la base de datos." }, { status: 500 });
    }

    return Response.json(updatedPromo);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error al procesar la solicitud de actualización." }, { status: 400 });
  }
}
