const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}

async function supabase(env, path, init = {}) {
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);

    try {
      if (url.pathname === "/health") {
        return json({ ok: true, service: "nexora-api", timestamp: new Date().toISOString() });
      }

      if (url.pathname.startsWith("/profiles/") && request.method === "GET") {
        const username = decodeURIComponent(url.pathname.slice("/profiles/".length));
        if (!username) return json({ error: "username is required" }, 400);
        const rows = await supabase(env, `/rest/v1/profiles?select=*&username=eq.${encodeURIComponent(username)}&limit=1`);
        return json(rows[0] || null, rows[0] ? 200 : 404);
      }

      if (url.pathname === "/events/play" && request.method === "POST") {
        const body = await request.json();
        const { track_id, beat_id } = body;
        if ((track_id ? 1 : 0) + (beat_id ? 1 : 0) !== 1) {
          return json({ error: "provide exactly one of track_id or beat_id" }, 400);
        }

        const table = track_id ? "tracks" : "beats";
        const id = track_id || beat_id;
        const column = track_id ? "id" : "id";
        const rows = await supabase(env, `/rest/v1/${table}?select=play_count&${column}=eq.${encodeURIComponent(id)}&limit=1`);
        if (!rows.length) return json({ error: "not found" }, 404);

        const nextCount = Number(rows[0].play_count || 0) + 1;
        const updated = await supabase(env, `/rest/v1/${table}?${column}=eq.${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ play_count: nextCount })
        });
        return json(updated[0] || { play_count: nextCount });
      }

      return json({ error: "not found" }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: "internal_error" }, 500);
    }
  }
};
