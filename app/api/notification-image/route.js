import sharp from "sharp";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return new Response("Failed to fetch image", { status: 400 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const aspect = metadata.width / metadata.height;
    
    // Si la imagen ya tiene una relación de aspecto de 2:1 o más ancha, la dejamos pasar.
    if (aspect >= 2) {
      const output = await image
        .resize({ width: 1024, fit: 'inside' })
        .toBuffer();
      return new Response(output, {
        headers: {
          "Content-Type": `image/${metadata.format || 'jpeg'}`,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // Obtener el color del píxel superior izquierdo (0, 0)
    // Extraemos 1x1 píxeles y leemos sus valores raw
    const pixel = await sharp(buffer)
      .extract({ left: 0, top: 0, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const r = pixel.data[0];
    const g = pixel.data[1];
    const b = pixel.data[2];
    const a = pixel.data[3];
    const alpha = a !== undefined ? a / 255 : 1;

    // Queremos que el lienzo final tenga una relación 2:1 (1024x512)
    // Redimensionamos la imagen original para que su altura sea de 512px
    const targetHeight = 512;
    const targetWidth = 1024;

    const resizedOriginal = await sharp(buffer)
      .resize({ height: targetHeight, fit: 'inside' })
      .toBuffer();

    // Creamos la imagen final de 1024x512 con el color de fondo y colocamos la imagen original en el centro
    const output = await sharp({
      create: {
        width: targetWidth,
        height: targetHeight,
        channels: 4,
        background: { r, g, b, alpha }
      }
    })
      .composite([{ input: resizedOriginal, gravity: "center" }])
      .jpeg({ quality: 85 }) // Convertimos a JPEG para optimizar el peso en la notificación
      .toBuffer();

    return new Response(output, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });

  } catch (error) {
    console.error("Error al procesar la imagen de notificación:", error);
    // En caso de error, redirigir a la imagen original como fallback
    return Response.redirect(imageUrl, 302);
  }
}
