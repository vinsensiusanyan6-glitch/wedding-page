import { verifySession } from "./auth.js";
import { callGoogleScript } from "./photos.js";

const SLOTS = new Set(["groom", "bride", "photo01", "photo02", "photo03", "photo04", "photo05", "photo06"]);
const MAX_SIZE = 8 * 1024 * 1024;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHT3gwV-qpFUMKgu26zE7Xt_P4LqRA_bnIKMLv-ga1fJP1YQTevBhduNvi_y8fV_pbKQ/exec";
const GOOGLE_SCRIPT_TOKEN = "WeddingGallery12345";

export async function onRequestPost({ request, env }) {
  if (!(await verifySession(request, env))) return json({ error: "Unauthorized" }, 401);
  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  if (!SLOTS.has(slot)) return json({ error: "Slot foto tidak valid." }, 400);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "File foto tidak ditemukan." }, 400);
  if (!file.type.startsWith("image/")) return json({ error: "File harus berupa gambar." }, 400);
  if (file.size > MAX_SIZE) return json({ error: "Ukuran maksimal 8 MB." }, 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);

  try {
    const data = await callGoogleScript({ GOOGLE_SCRIPT_URL, GOOGLE_SCRIPT_TOKEN }, {
      action: "upload",
      slot,
      filename: file.name,
      mimeType: file.type,
      base64
    });
    return json({ ok: true, slot, url: data.url });
  } catch (error) {
    return json({ error: error.message || "Upload gagal." }, 502);
  }
}

export async function onRequestDelete({ request, env }) {
  if (!(await verifySession(request, env))) return json({ error: "Unauthorized" }, 401);
  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  if (!SLOTS.has(slot)) return json({ error: "Slot foto tidak valid." }, 400);

  try {
    await callGoogleScript({ GOOGLE_SCRIPT_URL, GOOGLE_SCRIPT_TOKEN }, { action: "delete", slot });
    return json({ ok: true, slot });
  } catch (error) {
    return json({ error: error.message || "Gagal menghapus foto." }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
