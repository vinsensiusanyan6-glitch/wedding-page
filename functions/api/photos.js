const SLOTS = ["groom", "bride", "photo01", "photo02", "photo03", "photo04", "photo05", "photo06"];

export async function onRequestGet({ env }) {
  if (!env.GOOGLE_SCRIPT_URL || !env.GOOGLE_SCRIPT_TOKEN) return json({});

  try {
    const data = await callGoogleScript(env, { action: "photos" });
    const result = {};
    for (const slot of SLOTS) {
      if (data.photos?.[slot]) result[slot] = data.photos[slot];
    }
    return json(result);
  } catch (error) {
    return json({ error: "Tidak dapat memuat foto." }, 502);
  }
}

async function callGoogleScript(env, payload) {
  const response = await fetch(env.GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: env.GOOGLE_SCRIPT_TOKEN, ...payload })
  });

  const text = await response.text();
  let data = {};
  try { data = JSON.parse(text); } catch (_) {}
  if (!response.ok || data.ok === false) throw new Error(data.error || `Google Apps Script HTTP ${response.status}`);
  return data;
}

export { callGoogleScript };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
