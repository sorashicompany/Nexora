const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Telegram-Bot-Api-Secret-Token, X-Nexora-Setup-Secret"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
  });
}

function randomToken(bytes = 24) {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return btoa(String.fromCharCode(...data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacPassword(env, telegramId) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.TELEGRAM_AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(telegramId)));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") + "N9!";
}

async function supabase(env, path, init = {}) {
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function telegram(env, method, body = {}) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description || "request failed"}`);
  return data.result;
}

async function createOrLoadTelegramUser(env, tgUser, action) {
  const existing = await supabase(env, `/rest/v1/telegram_accounts?select=*&telegram_id=eq.${encodeURIComponent(tgUser.id)}&limit=1`);
  if (existing.length && action === "register") throw new Error("ACCOUNT_EXISTS");
  if (!existing.length && action === "login") throw new Error("ACCOUNT_NOT_FOUND");

  const email = `telegram_${tgUser.id}@accounts.nexora.local`;
  const password = await hmacPassword(env, tgUser.id);
  let userId;
  if (existing.length) {
    userId = existing[0].user_id;
    await supabase(env, `/rest/v1/telegram_accounts?telegram_id=eq.${encodeURIComponent(tgUser.id)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ username: tgUser.username || null, display_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ").slice(0, 80) || null, updated_at: new Date().toISOString() }) });
  } else {
    const created = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, { method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { telegram_id: String(tgUser.id), telegram_username: tgUser.username || null } }) });
    const createdText = await created.text();
    if (!created.ok) throw new Error(`Supabase admin ${created.status}: ${createdText}`);
    userId = JSON.parse(createdText).id;
    const display = String([tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || `user_${tgUser.id}`).slice(0, 80);
    await supabase(env, "/rest/v1/profiles", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: userId, username: `tg_${tgUser.id}`, display_name: display, profile_type: "artist" }) });
    await supabase(env, "/rest/v1/telegram_accounts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ telegram_id: tgUser.id, user_id: userId, username: tgUser.username || null, display_name: display }) });
  }

  const login = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const loginText = await login.text();
  if (!login.ok) throw new Error(`Supabase auth ${login.status}: ${loginText}`);
  return { userId, session: JSON.parse(loginText) };
}

async function handleTelegramWebhook(request, env) {
  if (env.TELEGRAM_WEBHOOK_SECRET && request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) return json({ error: "forbidden" }, 403);
  const update = await request.json();
  const message = update.message;
  if (!message || !message.from || typeof message.text !== "string") return json({ ok: true });
  const match = message.text.trim().match(/^\/start(?:@[^\s]+)?(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
  if (!match || !match[1]) { await telegram(env, "sendMessage", { chat_id: message.chat.id, text: "Откройте Nexora и выберите «Войти» или «Регистрация», чтобы получить ссылку для подключения Telegram." }); return json({ ok: true }); }
  const challenge = match[1];
  const rows = await supabase(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(challenge)}&status=eq.pending&limit=1`);
  if (!rows.length || new Date(rows[0].expires_at).getTime() < Date.now()) { await telegram(env, "sendMessage", { chat_id: message.chat.id, text: "Ссылка Nexora истекла. Вернитесь в приложение и начните авторизацию заново." }); return json({ ok: true }); }
  try {
    const result = await createOrLoadTelegramUser(env, message.from, rows[0].action);
    await supabase(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(challenge)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "approved", telegram_id: message.from.id, telegram_username: message.from.username || null, display_name: [message.from.first_name, message.from.last_name].filter(Boolean).join(" "), access_token: result.session.access_token, refresh_token: result.session.refresh_token }) });
    await telegram(env, "sendMessage", { chat_id: message.chat.id, text: "Telegram подтверждён. Вернитесь в Nexora — вход будет завершён автоматически." });
  } catch (error) {
    const code = String(error.message || error);
    const text = code.includes("ACCOUNT_EXISTS") ? "Аккаунт уже существует. Выберите «Войти», а не регистрацию." : code.includes("ACCOUNT_NOT_FOUND") ? "Аккаунт Nexora для этого Telegram ещё не зарегистрирован. Выберите «Регистрация»." : "Не удалось завершить авторизацию. Попробуйте ещё раз.";
    await supabase(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(challenge)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ status: "rejected" }) });
    await telegram(env, "sendMessage", { chat_id: message.chat.id, text });
  }
  return json({ ok: true });
}

async function setupTelegramWebhook(request, env) {
  const setupSecret = request.headers.get("X-Nexora-Setup-Secret");
  if (!env.TELEGRAM_AUTH_SECRET || setupSecret !== env.TELEGRAM_AUTH_SECRET) return json({ error: "forbidden" }, 403);
  const url = new URL(request.url);
  const webhookUrl = `${url.origin}/telegram/webhook`;
  const result = await telegram(env, "setWebhook", {
    url: webhookUrl,
    secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    allowed_updates: ["message"],
    drop_pending_updates: true
  });
  return json({ ok: result === true, webhook: webhookUrl });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    try {
      if (url.pathname === "/health") return json({ ok: true, service: "nexora-api", timestamp: new Date().toISOString() });
      if (url.pathname === "/telegram/bot" && request.method === "GET") { const me = await telegram(env, "getMe"); return json({ username: me.username, name: me.first_name }); }
      if (url.pathname === "/telegram/setup" && request.method === "POST") return setupTelegramWebhook(request, env);
      if (url.pathname === "/telegram/auth/start" && request.method === "POST") { const body = await request.json(); const action = body.action === "register" ? "register" : "login"; const challenge = randomToken(32); await supabase(env, "/rest/v1/telegram_auth_challenges", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ challenge, action }) }); const me = await telegram(env, "getMe"); return json({ challenge, action, bot_username: me.username, deep_link: `https://t.me/${me.username}?start=${challenge}`, expires_in: 300 }); }
      if (url.pathname === "/telegram/auth/poll" && request.method === "GET") { const challenge = url.searchParams.get("challenge"); if (!challenge) return json({ error: "challenge is required" }, 400); const rows = await supabase(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(challenge)}&limit=1`); if (!rows.length) return json({ status: "expired" }, 404); const row = rows[0]; if (new Date(row.expires_at).getTime() < Date.now() && row.status === "pending") return json({ status: "expired" }, 410); if (row.status === "pending") return json({ status: "pending" }); if (row.status === "rejected") return json({ status: "rejected" }); if (row.status === "approved") { await supabase(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(challenge)}`, { method: "DELETE" }); return json({ status: "approved", access_token: row.access_token, refresh_token: row.refresh_token, telegram_username: row.telegram_username, display_name: row.display_name }); } }
      if (url.pathname === "/telegram/webhook" && request.method === "POST") return handleTelegramWebhook(request, env);
      if (url.pathname.startsWith("/profiles/") && request.method === "GET") { const username = decodeURIComponent(url.pathname.slice("/profiles/".length)); if (!username) return json({ error: "username is required" }, 400); const rows = await supabase(env, `/rest/v1/profiles?select=*&username=eq.${encodeURIComponent(username)}&limit=1`); return json(rows[0] || null, rows[0] ? 200 : 404); }
      return json({ error: "not found" }, 404);
    } catch (error) { console.error(error); return json({ error: "internal_error" }, 500); }
  }
};
