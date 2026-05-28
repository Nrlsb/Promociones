import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import webpush from "web-push";

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

    // Asegurar que el bucket existe usando el cliente admin y acepta imágenes
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find(b => b.name === BUCKET)) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, {
        public: true,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        fileSizeLimit: MAX_SIZE
      });
      if (bucketError) {
        console.error("Error al crear bucket:", bucketError);
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

    // Obtener términos y condiciones en texto
    const terms = formData.get("terms")?.toString().trim() || null;

    // Obtener cuotas
    const installments = formData.get("installments")?.toString().trim() || null;

    // Obtener métodos de pago
    let payment_methods = [];
    const paymentMethodsRaw = formData.get("payment_methods");
    if (paymentMethodsRaw) {
      try {
        payment_methods = JSON.parse(paymentMethodsRaw);
      } catch (e) {
        console.error("Error parsing payment_methods:", e);
      }
    }

    const { data: promo, error: dbError } = await supabaseAdmin
      .from("promotions")
      .insert({ 
        title, 
        description, 
        url: publicUrl, 
        filename,
        terms,
        payment_methods,
        installments
      })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      return Response.json({ error: "Error al guardar en la base de datos." }, { status: 500 });
    }

    // Enviar notificaciones push de forma asíncrona a todos los dispositivos suscritos
    try {
      const { data: subscriptions, error: fetchSubsError } = await supabaseAdmin
        .from("push_subscriptions")
        .select("id, subscription");

      if (subscriptions && subscriptions.length > 0 && !fetchSubsError) {
        // Inicializar VAPID dinámicamente en tiempo de ejecución para evitar errores en el build
        webpush.setVapidDetails(
          "mailto:soporte@tuweb.com",
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
          process.env.VAPID_PRIVATE_KEY || ""
        );

        // Obtener la URL base del servidor de forma dinámica a partir del request
        const requestUrl = new URL(request.url);
        const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
        const notificationImageUrl = `${baseUrl}/api/notification-image?url=${encodeURIComponent(publicUrl)}`;

        const payload = JSON.stringify({
          title: "¡Nueva Promoción!",
          body: title,
          url: "/", // Puedes redirigir a la raíz o a la promo específica si tienes rutas
          icon: "/logoMercurio.png",
          image: notificationImageUrl
        });

        const sendPromises = subscriptions.map((sub) =>
          webpush.sendNotification(sub.subscription, payload).catch(async (err) => {
            console.error(`Error enviando notificación a sub ID ${sub.id}:`, err);
            // Si el servicio responde 410 (Gone) o 404 (Not Found), la suscripción es inválida
            // y la eliminamos de la base de datos para mantenerla limpia.
            if (err.statusCode === 410 || err.statusCode === 404) {
              await supabaseAdmin
                .from("push_subscriptions")
                .delete()
                .eq("id", sub.id);
            }
          })
        );

        // Esperamos a que todas las promesas de envío finalicen (resueltas o rechazadas)
        await Promise.allSettled(sendPromises);
      }
    } catch (pushError) {
      console.error("Error general en el envío de notificaciones push:", pushError);
      // No bloqueamos la respuesta al cliente si el envío de notificaciones falla.
    }

    return Response.json(promo, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
