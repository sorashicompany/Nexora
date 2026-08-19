var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// creator-services.js
function base64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(base64url, "base64url");
function randomString(n = 32) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return base64url(b);
}
__name(randomString, "randomString");
async function sha256Base64Url(value) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64url(new Uint8Array(d));
}
__name(sha256Base64Url, "sha256Base64Url");
async function currentSupabaseUser(req, env) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("AUTH_CONFIG_ERROR");
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error("AUTH_UNAUTHORIZED");
  return await r.json();
}
__name(currentSupabaseUser, "currentSupabaseUser");
async function scToken(env, body) {
  if (!env.SOUNDCLOUD_CLIENT_ID || !env.SOUNDCLOUD_CLIENT_SECRET || !env.SOUNDCLOUD_REDIRECT_URI) throw new Error("SOUNDCLOUD_CONFIG_MISSING");
  const form = new URLSearchParams(body);
  const r = await fetch("https://secure.soundcloud.com/oauth/token", { method: "POST", headers: { accept: "application/json; charset=utf-8", "Content-Type": "application/x-www-form-urlencoded" }, body: form });
  const t = await r.text();
  if (!r.ok) throw new Error(`SOUNDCLOUD_TOKEN_${r.status}:${t}`);
  return JSON.parse(t);
}
__name(scToken, "scToken");
async function scFetch(token, path) {
  const r = await fetch(`https://api.soundcloud.com${path}`, { headers: { accept: "application/json; charset=utf-8", Authorization: `OAuth ${token}` } });
  const t = await r.text();
  if (!r.ok) throw new Error(`SOUNDCLOUD_API_${r.status}:${t}`);
  return t ? JSON.parse(t) : null;
}
__name(scFetch, "scFetch");

// worker.js
var corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Telegram-Bot-Api-Secret-Token, X-Nexora-Setup-Secret" };
var json = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } }), "json");
function randomToken(bytes = 32) {
  const b = new Uint8Array(bytes);
  crypto.getRandomValues(b);
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
__name(randomToken, "randomToken");
function authError(code, message = "") {
  const e = new Error(message || code);
  e.authCode = code;
  return e;
}
__name(authError, "authError");
function classify(e) {
  if (e?.authCode) return e.authCode;
  const s = String(e?.message || e || "");
  if (s.includes("AUTH_UNAUTHORIZED")) return "AUTH_UNAUTHORIZED";
  if (s.includes("SOUNDCLOUD_CONFIG_MISSING")) return "AUTH_CONFIG_ERROR";
  if (s.includes("SOUNDCLOUD_")) return "SOUNDCLOUD_ERROR";
  if (s.includes("SUPABASE_CONFIG_MISSING") || s.includes("_MISSING")) return "AUTH_CONFIG_ERROR";
  if (s.includes("ACCOUNT_EXISTS")) return "AUTH_ACCOUNT_EXISTS";
  if (s.includes("ACCOUNT_NOT_FOUND")) return "AUTH_ACCOUNT_NOT_FOUND";
  if (s.includes("Supabase")) return "AUTH_DATABASE_ERROR";
  return "AUTH_DATABASE_ERROR";
}
__name(classify, "classify");
async function hmacPassword(env, id) {
  if (!env.TELEGRAM_AUTH_SECRET) throw authError("AUTH_CONFIG_ERROR", "TELEGRAM_AUTH_SECRET_MISSING");
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.TELEGRAM_AUTH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(String(id)));
  return btoa(String.fromCharCode(...new Uint8Array(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") + "N9!";
}
__name(hmacPassword, "hmacPassword");
async function sb(env, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw authError("AUTH_CONFIG_ERROR", "SUPABASE_CONFIG_MISSING");
  const r = await fetch(env.SUPABASE_URL + path, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", ...init.headers || {} } });
  const t = await r.text();
  if (!r.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase ${r.status}: ${t}`);
  return t ? JSON.parse(t) : null;
}
__name(sb, "sb");
async function tg(env, method, body = {}) {
  if (!env.TELEGRAM_BOT_TOKEN) throw authError("AUTH_CONFIG_ERROR", "TELEGRAM_BOT_TOKEN_MISSING");
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const d = await r.json();
  if (!d.ok) throw new Error(`Telegram ${method}: ${d.description || "failed"}`);
  return d.result;
}
__name(tg, "tg");
async function authAdmin(env, email, password, meta) {
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, { method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ email, password, email_confirm: true, user_metadata: meta }) });
  const t = await r.text();
  let data = null;
  try {
    data = t ? JSON.parse(t) : null;
  } catch {
  }
  return { ok: r.ok, status: r.status, data };
}
__name(authAdmin, "authAdmin");
async function findAuthUser(env, email) {
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } });
  const t = await r.text();
  if (!r.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase admin list ${r.status}: ${t}`);
  const d = JSON.parse(t);
  return (d.users || []).find((u) => u.email === email) || null;
}
__name(findAuthUser, "findAuthUser");
async function createSession(env, email, password) {
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  const t = await r.text();
  if (!r.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase auth ${r.status}: ${t}`);
  return JSON.parse(t);
}
__name(createSession, "createSession");
async function ensureUser(env, tgUser, action) {
  const tid = String(tgUser.id), email = `telegram_${tid}@accounts.nexora.local`, password = await hmacPassword(env, tid), display = String([tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || tgUser.username || `user_${tid}`).slice(0, 80), username = `tg_${tid}`;
  let accounts = await sb(env, `/rest/v1/telegram_accounts?select=*&telegram_id=eq.${encodeURIComponent(tid)}&limit=1`);
  let userId = accounts[0]?.user_id;
  if (action === "login" && !userId) throw authError("AUTH_ACCOUNT_NOT_FOUND");
  if (action === "register" && userId) throw authError("AUTH_ACCOUNT_EXISTS");
  if (!userId) {
    const created = await authAdmin(env, email, password, { telegram_id: tid, telegram_username: tgUser.username || null });
    if (created.ok) userId = created.data?.id;
    else if (created.status === 422 || /already|exists|duplicate/i.test(JSON.stringify(created.data || {}))) {
      const existing = await findAuthUser(env, email);
      if (!existing) throw authError("AUTH_DATABASE_ERROR", "existing user not found");
      userId = existing.id;
    } else throw authError("AUTH_DATABASE_ERROR", `Supabase admin ${created.status}`);
    if (!userId) throw authError("AUTH_DATABASE_ERROR", "Supabase admin did not return user id");
  }
  const profile = await sb(env, `/rest/v1/profiles?select=id,profile_type&id=eq.${encodeURIComponent(userId)}&limit=1`);
  if (!profile.length) await sb(env, "/rest/v1/profiles", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ id: userId, username, display_name: display, profile_type: "user" }) });
  else await sb(env, `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ display_name: display, updated_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  if (!accounts.length) await sb(env, "/rest/v1/telegram_accounts", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ telegram_id: tid, user_id: userId, username: tgUser.username || null, display_name: display }) });
  else await sb(env, `/rest/v1/telegram_accounts?telegram_id=eq.${encodeURIComponent(tid)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: userId, username: tgUser.username || null, display_name: display, updated_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  return { userId, session: await createSession(env, email, password) };
}
__name(ensureUser, "ensureUser");
async function patchChallenge(env, c, p) {
  await sb(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(c)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify(p) });
}
__name(patchChallenge, "patchChallenge");
async function webhook(req, env) {
  if (env.TELEGRAM_WEBHOOK_SECRET && req.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) return json({ error: "forbidden" }, 403);
  const u = await req.json(), m = u.message;
  if (!m?.from || typeof m.text !== "string") return json({ ok: true });
  const match = m.text.trim().match(/^\/start(?:@[^\s]+)?(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
  if (!match?.[1]) {
    await tg(env, "sendMessage", { chat_id: m.chat.id, text: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Nexora. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412\u043E\u0439\u0442\u0438\xBB \u0438\u043B\u0438 \xAB\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F\xBB." });
    return json({ ok: true });
  }
  const c = match[1], rows = await sb(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(c)}&status=eq.pending&limit=1`);
  if (!rows.length) {
    await tg(env, "sendMessage", { chat_id: m.chat.id, text: "\u0421\u0441\u044B\u043B\u043A\u0430 Nexora \u043D\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0438\u043B\u0438 \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0430. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0437\u0430\u043D\u043E\u0432\u043E \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438." });
    return json({ ok: true });
  }
  const ch = rows[0];
  if (new Date(ch.expires_at).getTime() < Date.now()) {
    await patchChallenge(env, c, { status: "expired" });
    await tg(env, "sendMessage", { chat_id: m.chat.id, text: "\u0421\u0441\u044B\u043B\u043A\u0430 Nexora \u0438\u0441\u0442\u0435\u043A\u043B\u0430. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0437\u0430\u043D\u043E\u0432\u043E." });
    return json({ ok: true });
  }
  try {
    const r = await ensureUser(env, m.from, ch.action);
    await patchChallenge(env, c, { status: "approved", telegram_id: m.from.id, telegram_username: m.from.username || null, display_name: [m.from.first_name, m.from.last_name].filter(Boolean).join(" ").slice(0, 80), access_token: r.session.access_token, refresh_token: r.session.refresh_token });
    await tg(env, "sendMessage", { chat_id: m.chat.id, text: "Telegram \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D. \u0412\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u0432 Nexora \u2014 \u0432\u0445\u043E\u0434 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438." });
  } catch (e) {
    const code = classify(e);
    console.error("Telegram auth failed", { code, challenge: c, telegram_id: m.from.id, message: String(e?.message || e) });
    const text = { AUTH_CONFIG_ERROR: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 Nexora. \u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443.", AUTH_DATABASE_ERROR: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C\u0441\u044F \u043A \u0441\u0435\u0440\u0432\u0435\u0440\u0443 Nexora. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.", AUTH_ACCOUNT_EXISTS: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 Nexora \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412\u043E\u0439\u0442\u0438\xBB \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438.", AUTH_ACCOUNT_NOT_FOUND: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 Nexora \u0435\u0449\u0451 \u043D\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F\xBB \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438." }[code] || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.";
    if (code === "AUTH_ACCOUNT_EXISTS" || code === "AUTH_ACCOUNT_NOT_FOUND") await patchChallenge(env, c, { status: "rejected" });
    await tg(env, "sendMessage", { chat_id: m.chat.id, text: `${text}

\u041A\u043E\u0434: ${code}` });
  }
  return json({ ok: true });
}
__name(webhook, "webhook");
async function setup(req, env) {
  if (!env.TELEGRAM_AUTH_SECRET || req.headers.get("X-Nexora-Setup-Secret") !== env.TELEGRAM_AUTH_SECRET) return json({ error: "forbidden" }, 403);
  if (!env.TELEGRAM_WEBHOOK_SECRET) return json({ error: "TELEGRAM_WEBHOOK_SECRET_MISSING" }, 500);
  const url = new URL(req.url), w = `${url.origin}/telegram/webhook`;
  await tg(env, "setWebhook", { url: w, secret_token: env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ["message"], drop_pending_updates: true });
  return json({ ok: true, webhook: w });
}
__name(setup, "setup");
async function debug(env) {
  const checks = { supabase_url: Boolean(env.SUPABASE_URL), supabase_service_role: Boolean(env.SUPABASE_SERVICE_ROLE_KEY), telegram_bot_token: Boolean(env.TELEGRAM_BOT_TOKEN), telegram_auth_secret: Boolean(env.TELEGRAM_AUTH_SECRET), telegram_webhook_secret: Boolean(env.TELEGRAM_WEBHOOK_SECRET), soundcloud_client_id: Boolean(env.SOUNDCLOUD_CLIENT_ID), soundcloud_client_secret: Boolean(env.SOUNDCLOUD_CLIENT_SECRET), soundcloud_redirect_uri: Boolean(env.SOUNDCLOUD_REDIRECT_URI) };
  return json({ ok: Object.values(checks).every(Boolean), checks });
}
__name(debug, "debug");
async function soundcloudConnect(req, env) {
  const user = await currentSupabaseUser(req, env);
  if (!env.SOUNDCLOUD_CLIENT_ID || !env.SOUNDCLOUD_CLIENT_SECRET || !env.SOUNDCLOUD_REDIRECT_URI) return json({ error: "SOUNDCLOUD_CONFIG_MISSING" }, 503);
  const verifier = randomString(48), challenge = await sha256Base64Url(verifier), state = randomToken(32), expires = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  await sb(env, "/rest/v1/soundcloud_oauth_states", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ state, user_id: user.id, code_verifier: verifier, expires_at: expires }) });
  const q = new URLSearchParams({ client_id: env.SOUNDCLOUD_CLIENT_ID, redirect_uri: env.SOUNDCLOUD_REDIRECT_URI, response_type: "code", code_challenge: challenge, code_challenge_method: "S256", state, display: "popup" });
  return json({ authorize_url: `https://secure.soundcloud.com/authorize?${q}` });
}
__name(soundcloudConnect, "soundcloudConnect");
async function soundcloudCallback(req, env) {
  const u = new URL(req.url), code = u.searchParams.get("code"), state = u.searchParams.get("state"), error = u.searchParams.get("error");
  if (error) return new Response(`<html><body><h2>Nexora</h2><p>SoundCloud authorization was cancelled.</p></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  if (!code || !state) return new Response("Missing code or state", { status: 400 });
  const rows = await sb(env, `/rest/v1/soundcloud_oauth_states?select=*&state=eq.${encodeURIComponent(state)}&limit=1`);
  if (!rows.length || new Date(rows[0].expires_at).getTime() < Date.now()) return new Response("Authorization expired", { status: 400 });
  const st = rows[0];
  const tok = await scToken(env, { grant_type: "authorization_code", client_id: env.SOUNDCLOUD_CLIENT_ID, client_secret: env.SOUNDCLOUD_CLIENT_SECRET, redirect_uri: env.SOUNDCLOUD_REDIRECT_URI, code_verifier: st.code_verifier, code });
  const me = await scFetch(tok.access_token, "/me");
  const tracks = await scFetch(tok.access_token, "/me/tracks?limit=50&linked_partitioning=true");
  const expiresAt = new Date(Date.now() + Number(tok.expires_in || 3600) * 1e3).toISOString();
  await sb(env, "/rest/v1/soundcloud_connections", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: st.user_id, soundcloud_user_id: String(me.id ?? me.urn ?? me.username), username: me.username || null, permalink_url: me.permalink_url || null, avatar_url: me.avatar_url || null, access_token: tok.access_token, refresh_token: tok.refresh_token || null, expires_at: expiresAt, scope: tok.scope || null, updated_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  const list = Array.isArray(tracks?.collection) ? tracks.collection : [];
  await sb(env, `/rest/v1/soundcloud_tracks?user_id=eq.${encodeURIComponent(st.user_id)}`, { method: "DELETE" });
  if (list.length) await sb(env, "/rest/v1/soundcloud_tracks", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(list.map((t, i) => ({ user_id: st.user_id, soundcloud_track_id: String(t.id ?? t.urn), urn: t.urn || null, title: t.title || "Untitled", permalink_url: t.permalink_url || null, artwork_url: t.artwork_url || null, duration_ms: t.duration || null, playback_count: t.playback_count || 0, genre: t.genre || null, created_at: t.created_at || null, position: i, synced_at: (/* @__PURE__ */ new Date()).toISOString() }))) });
  await sb(env, `/rest/v1/soundcloud_oauth_states?state=eq.${encodeURIComponent(state)}`, { method: "DELETE" });
  return new Response(`<html><head><meta name="viewport" content="width=device-width"></head><body style="font-family:sans-serif;background:#040a13;color:white;text-align:center;padding:48px"><h2>SoundCloud \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D</h2><p>\u0412\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u0432 Nexora. \u0422\u0440\u0435\u043A\u0438 \u0443\u0436\u0435 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u0443\u044E\u0442\u0441\u044F.</p></body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
__name(soundcloudCallback, "soundcloudCallback");
async function soundcloudStatus(req, env) {
  const user = await currentSupabaseUser(req, env);
  const c = await sb(env, `/rest/v1/soundcloud_connections?select=soundcloud_user_id,username,permalink_url,avatar_url,expires_at,scope&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  const tracks = await sb(env, `/rest/v1/soundcloud_tracks?select=soundcloud_track_id,urn,title,permalink_url,artwork_url,duration_ms,playback_count,genre,created_at,position&user_id=eq.${encodeURIComponent(user.id)}&order=position.asc&limit=50`);
  return json({ connected: Boolean(c.length), connection: c[0] || null, tracks });
}
__name(soundcloudStatus, "soundcloudStatus");
async function beatchainConnect(req, env) {
  const user = await currentSupabaseUser(req, env), b = await req.json(), url = String(b.profile_url || "").trim();
  if (!/^https?:\/\/(www\.)?beatchain\.com\//i.test(url)) return json({ error: "INVALID_BEATCHAIN_URL" }, 400);
  await sb(env, "/rest/v1/beatchain_connections", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ user_id: user.id, profile_url: url, display_name: b.display_name || null, updated_at: (/* @__PURE__ */ new Date()).toISOString() }) });
  return json({ connected: true, profile_url: url });
}
__name(beatchainConnect, "beatchainConnect");
async function beatchainStatus(req, env) {
  const user = await currentSupabaseUser(req, env);
  const c = await sb(env, `/rest/v1/beatchain_connections?select=profile_url,display_name,updated_at&user_id=eq.${encodeURIComponent(user.id)}&limit=1`);
  return json({ connected: Boolean(c.length), connection: c[0] || null });
}
__name(beatchainStatus, "beatchainStatus");
var worker_default = { async fetch(req, env) {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const u = new URL(req.url);
  try {
    if (u.pathname === "/health") return json({ ok: true, service: "nexora-api" });
    if (u.pathname === "/telegram/debug" && req.method === "GET") return debug(env);
    if (u.pathname === "/telegram/bot" && req.method === "GET") {
      const me = await tg(env, "getMe");
      return json({ username: me.username, name: me.first_name });
    }
    if (u.pathname === "/telegram/setup" && req.method === "POST") return setup(req, env);
    if (u.pathname === "/telegram/auth/start" && req.method === "POST") {
      const b = await req.json(), action = b.action === "register" ? "register" : "login", challenge = randomToken();
      await sb(env, "/rest/v1/telegram_auth_challenges", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ challenge, action, status: "pending" }) });
      const me = await tg(env, "getMe");
      return json({ challenge, action, bot_username: me.username, deep_link: `https://t.me/${me.username}?start=${challenge}`, expires_in: 300 });
    }
    if (u.pathname === "/telegram/auth/poll" && req.method === "GET") {
      const c = u.searchParams.get("challenge");
      if (!c) return json({ error: "challenge is required" }, 400);
      const rows = await sb(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(c)}&limit=1`);
      if (!rows.length) return json({ status: "expired" }, 404);
      const r = rows[0];
      if (new Date(r.expires_at).getTime() < Date.now() && r.status === "pending") {
        await patchChallenge(env, c, { status: "expired" });
        return json({ status: "expired" }, 410);
      }
      if (r.status === "pending") return json({ status: "pending" });
      if (r.status === "rejected") return json({ status: "rejected" });
      if (r.status === "approved") {
        await sb(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(c)}`, { method: "DELETE" });
        return json({ status: "approved", access_token: r.access_token, refresh_token: r.refresh_token, telegram_username: r.telegram_username, display_name: r.display_name });
      }
      return json({ status: "pending" });
    }
    if (u.pathname === "/telegram/webhook" && req.method === "POST") return webhook(req, env);
    if (u.pathname === "/soundcloud/connect" && req.method === "POST") return soundcloudConnect(req, env);
    if (u.pathname === "/soundcloud/callback" && req.method === "GET") return soundcloudCallback(req, env);
    if (u.pathname === "/soundcloud/status" && req.method === "GET") return soundcloudStatus(req, env);
    if (u.pathname === "/beatchain/connect" && req.method === "POST") return beatchainConnect(req, env);
    if (u.pathname === "/beatchain/status" && req.method === "GET") return beatchainStatus(req, env);
    return json({ error: "not found" }, 404);
  } catch (e) {
    const code = classify(e);
    console.error("Nexora Worker request failed", { path: u.pathname, code, message: String(e?.message || e) });
    return json({ error: code }, code === "AUTH_UNAUTHORIZED" ? 401 : 500);
  }
} };

// worker-entry.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Telegram-Bot-Api-Secret-Token, X-Nexora-Setup-Secret"
};
var json2 = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" }
}), "json");
function authError2(code, message = code) {
  const e = new Error(message);
  e.authCode = code;
  return e;
}
__name(authError2, "authError");
function classify2(e) {
  if (e?.authCode) return e.authCode;
  const s = String(e?.message || e || "");
  if (s.includes("SUPABASE_CONFIG_MISSING")) return "AUTH_CONFIG_ERROR";
  if (s.includes("Supabase auth")) return "AUTH_DATABASE_ERROR";
  if (s.includes("Supabase")) return "AUTH_DATABASE_ERROR";
  return "AUTH_DATABASE_ERROR";
}
__name(classify2, "classify");
async function sb2(env, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw authError2("AUTH_CONFIG_ERROR", "SUPABASE_CONFIG_MISSING");
  }
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...init.headers || {}
    }
  });
  const text = await response.text();
  if (!response.ok) throw authError2("AUTH_DATABASE_ERROR", `Supabase ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}
__name(sb2, "sb");
async function telegram(env, method, body = {}) {
  if (!env.TELEGRAM_BOT_TOKEN) throw authError2("AUTH_CONFIG_ERROR", "TELEGRAM_BOT_TOKEN_MISSING");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description || "failed"}`);
  return data.result;
}
__name(telegram, "telegram");
async function hmacPassword2(env, telegramId) {
  if (!env.TELEGRAM_AUTH_SECRET) throw authError2("AUTH_CONFIG_ERROR", "TELEGRAM_AUTH_SECRET_MISSING");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.TELEGRAM_AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(telegramId)));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") + "N9!";
}
__name(hmacPassword2, "hmacPassword");
async function authAdmin2(env, email, password, metadata) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata })
  });
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
  }
  return { ok: response.ok, status: response.status, data };
}
__name(authAdmin2, "authAdmin");
async function findAuthUser2(env, email) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const text = await response.text();
  if (!response.ok) throw authError2("AUTH_DATABASE_ERROR", `Supabase admin list ${response.status}: ${text}`);
  const data = JSON.parse(text);
  return (data.users || []).find((user) => user.email === email) || null;
}
__name(findAuthUser2, "findAuthUser");
async function createSession2(env, email, password) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  const text = await response.text();
  if (!response.ok) throw authError2("AUTH_DATABASE_ERROR", `Supabase auth ${response.status}: ${text}`);
  return JSON.parse(text);
}
__name(createSession2, "createSession");
function telegramDisplay(user) {
  return String(
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || `user_${user.id}`
  ).slice(0, 80);
}
__name(telegramDisplay, "telegramDisplay");
function telegramUsername(user) {
  const raw = String(user.username || `tg_${user.id}`).toLowerCase();
  const clean = raw.replace(/[^a-z0-9_]/g, "_").slice(0, 28);
  return clean.length >= 3 ? clean : `tg_${user.id}`.slice(0, 32);
}
__name(telegramUsername, "telegramUsername");
async function ensureUser2(env, tgUser, action) {
  const telegramId = String(tgUser.id);
  const email = `telegram_${telegramId}@accounts.nexora.local`;
  const password = await hmacPassword2(env, telegramId);
  const displayName = telegramDisplay(tgUser);
  const username = telegramUsername(tgUser);
  const accounts = await sb2(env, `/rest/v1/telegram_accounts?select=telegram_id,user_id,username,display_name&telegram_id=eq.${encodeURIComponent(telegramId)}&limit=1`);
  let userId = accounts[0]?.user_id || null;
  if (action === "login" && !userId) {
    const existing = await findAuthUser2(env, email);
    if (!existing) throw authError2("AUTH_ACCOUNT_NOT_FOUND");
    userId = existing.id;
  }
  if (action === "register" && userId) throw authError2("AUTH_ACCOUNT_EXISTS");
  if (!userId) {
    const created = await authAdmin2(env, email, password, {
      telegram_id: telegramId,
      telegram_username: tgUser.username || null
    });
    if (created.ok) {
      userId = created.data?.id || null;
    } else if (created.status === 422 || /already|exists|duplicate/i.test(JSON.stringify(created.data || {}))) {
      const existing = await findAuthUser2(env, email);
      if (!existing) throw authError2("AUTH_DATABASE_ERROR", "Supabase user exists but cannot be resolved");
      if (action === "register") throw authError2("AUTH_ACCOUNT_EXISTS");
      userId = existing.id;
    } else {
      throw authError2("AUTH_DATABASE_ERROR", `Supabase admin ${created.status}: ${JSON.stringify(created.data || {})}`);
    }
  }
  if (!userId) throw authError2("AUTH_DATABASE_ERROR", "Supabase admin did not return user id");
  const profiles = await sb2(env, `/rest/v1/profiles?select=id,username,profile_type& id=eq.${encodeURIComponent(userId)}&limit=1`.replace("?select=id,username,profile_type& id", "?select=id,username,profile_type&id"));
  if (!profiles.length) {
    try {
      await sb2(env, "/rest/v1/profiles", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          id: userId,
          username,
          display_name: displayName,
          profile_type: "user"
        })
      });
    } catch (e) {
      const repaired = await sb2(env, `/rest/v1/profiles?select=id& id=eq.${encodeURIComponent(userId)}&limit=1`.replace("?select=id& id", "?select=id&id"));
      if (!repaired.length) throw e;
    }
  } else {
    await sb2(env, `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ display_name: displayName, updated_at: (/* @__PURE__ */ new Date()).toISOString() })
    });
  }
  await sb2(env, "/rest/v1/telegram_accounts", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      telegram_id: Number(telegramId),
      user_id: userId,
      username: tgUser.username || null,
      display_name: displayName,
      avatar_url: null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    })
  });
  return { userId, session: await createSession2(env, email, password) };
}
__name(ensureUser2, "ensureUser");
async function patchChallenge2(env, challenge, patch) {
  await sb2(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(challenge)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch)
  });
}
__name(patchChallenge2, "patchChallenge");
async function handleTelegramWebhook(request, env) {
  if (env.TELEGRAM_WEBHOOK_SECRET && request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return json2({ error: "forbidden" }, 403);
  }
  const update = await request.json();
  const message = update?.message;
  if (!message?.from || typeof message.text !== "string") return json2({ ok: true });
  const match = message.text.trim().match(/^\/start(?:@[^\s]+)?(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
  if (!match?.[1]) {
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Nexora. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412\u043E\u0439\u0442\u0438\xBB \u0438\u043B\u0438 \xAB\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F\xBB."
    });
    return json2({ ok: true });
  }
  const challenge = match[1];
  const rows = await sb2(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(challenge)}&status=eq.pending&limit=1`);
  if (!rows.length) {
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "\u0421\u0441\u044B\u043B\u043A\u0430 Nexora \u043D\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0438\u043B\u0438 \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0430. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0437\u0430\u043D\u043E\u0432\u043E \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438."
    });
    return json2({ ok: true });
  }
  const current = rows[0];
  if (new Date(current.expires_at).getTime() < Date.now()) {
    await patchChallenge2(env, challenge, { status: "rejected" });
    await telegram(env, "sendMessage", { chat_id: message.chat.id, text: "\u0421\u0441\u044B\u043B\u043A\u0430 Nexora \u0438\u0441\u0442\u0435\u043A\u043B\u0430. \u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E \u0437\u0430\u043D\u043E\u0432\u043E." });
    return json2({ ok: true });
  }
  try {
    const result = await ensureUser2(env, message.from, current.action);
    await patchChallenge2(env, challenge, {
      status: "approved",
      telegram_id: message.from.id,
      telegram_username: message.from.username || null,
      display_name: telegramDisplay(message.from),
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token
    });
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "Telegram \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D. \u0412\u0435\u0440\u043D\u0438\u0442\u0435\u0441\u044C \u0432 Nexora \u2014 \u0432\u0445\u043E\u0434 \u0431\u0443\u0434\u0435\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438."
    });
  } catch (error) {
    const code = classify2(error);
    console.error("Telegram auth failed", {
      code,
      challenge,
      telegram_id: message.from.id,
      message: String(error?.message || error)
    });
    const text = {
      AUTH_CONFIG_ERROR: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 Nexora. \u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u043A \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443.",
      AUTH_DATABASE_ERROR: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C\u0441\u044F \u043A \u0441\u0435\u0440\u0432\u0435\u0440\u0443 Nexora. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432\u0440\u0435\u043C\u044F.",
      AUTH_ACCOUNT_EXISTS: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 Nexora \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0412\u043E\u0439\u0442\u0438\xBB \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438.",
      AUTH_ACCOUNT_NOT_FOUND: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 Nexora \u0435\u0449\u0451 \u043D\u0435 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043D. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \xAB\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F\xBB \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438."
    }[code] || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437.";
    await patchChallenge2(env, challenge, { status: "rejected" }).catch(() => {
    });
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: `${text}

\u041A\u043E\u0434: ${code}`
    });
  }
  return json2({ ok: true });
}
__name(handleTelegramWebhook, "handleTelegramWebhook");
var worker_entry_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try {
        return await handleTelegramWebhook(request, env);
      } catch (error) {
        console.error("Telegram webhook fatal error", String(error?.message || error));
        return json2({ ok: false }, 500);
      }
    }
    return worker_default.fetch(request, env, ctx);
  }
};
export {
  worker_entry_default as default
};
//# sourceMappingURL=worker-entry.js.map
