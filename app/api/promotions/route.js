import { readFile, writeFile, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "promotions.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

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

export async function GET() {
  const db = await readDB();
  return Response.json(db);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "ID requerido." }, { status: 400 });
  }

  const db = await readDB();
  const index = db.findIndex((p) => p.id === id);

  if (index === -1) {
    return Response.json({ error: "Promoción no encontrada." }, { status: 404 });
  }

  const [promo] = db.splice(index, 1);

  // Delete file from disk
  const filePath = path.join(UPLOAD_DIR, promo.filename);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }

  await writeDB(db);
  return Response.json({ success: true });
}
