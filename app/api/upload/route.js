import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "promotions.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

async function ensureDirs() {
  if (!existsSync(path.join(process.cwd(), "data"))) {
    await mkdir(path.join(process.cwd(), "data"), { recursive: true });
  }
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function readDB() {
  try {
    const raw = await readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeDB(data) {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function POST(request) {
  try {
    await ensureDirs();

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
    const filePath = path.join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);

    const promo = {
      id: randomUUID(),
      title,
      description,
      url: `/uploads/${filename}`,
      filename,
      createdAt: new Date().toISOString(),
    };

    const db = await readDB();
    db.unshift(promo);
    await writeDB(db);

    return Response.json(promo, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
