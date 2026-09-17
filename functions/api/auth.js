const COOKIE = "wedding_admin";
const MAX_AGE = 60 * 60 * 12;

export async function onRequestGet({ request, env }) {
  return json({ authenticated: await verifySession(request, env) });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "anyanadmin").trim();
  const password = String(body.password || "anyan96");

  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return json({ error: "Admin belum dikonfigurasi. Isi ADMIN_USER, ADMIN_PASSWORD, dan SESSION_SECRET di Cloudflare." }, 503);
  }

  if (username !== env.ADMIN_USER || password !== env.ADMIN_PASSWORD) {
    return json({ error: "Username atau password salah." }, 401);
  }

  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${env.ADMIN_USER}|${expires}`;
  const signature = await sign(payload, env.SESSION_SECRET);
  const token = `${b64url(payload)}.${signature}`;

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Strict`
    }
  });
}

export async function onRequestDelete() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
    }
  });
}

export async function verifySession(request, env) {
  if (!env.SESSION_SECRET || !env.ADMIN_USER) return false;
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!match) return false;

  const parts = match[1].split(".");
  if (parts.length !== 2) return false;

  const payload = unb64url(parts[0]);
  const [username, expiresText] = payload.split("|");
  const expires = Number(expiresText);
  if (username !== env.ADMIN_USER || !expires || expires < Math.floor(Date.now() / 1000)) return false;

  const expected = await sign(payload, env.SESSION_SECRET);
  return timingSafeEqual(parts[1], expected);
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToB64Url(new Uint8Array(signature));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function bytesToB64Url(bytes) {
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64url(value) {
  return bytesToB64Url(new TextEncoder().encode(value));
}

function unb64url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===";
  const binary = atob(padded.slice(0, padded.length - (padded.length % 4)));
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
