import legacy from "./worker.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Telegram-Bot-Api-Secret-Token, X-Nexora-Setup-Secret",
};

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
});

function authError(code, message = code) {
  const e = new Error(message);
  e.authCode = code;
  return e;
}

function classify(e) {
  if (e?.authCode) return e.authCode;
  const s = String(e?.message || e || "");
  if (s.includes("SUPABASE_CONFIG_MISSING")) return "AUTH_CONFIG_ERROR";
  if (s.includes("Supabase auth")) return "AUTH_DATABASE_ERROR";
  if (s.includes("Supabase")) return "AUTH_DATABASE_ERROR";
  return "AUTH_DATABASE_ERROR";
}

async function sb(env, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw authError("AUTH_CONFIG_ERROR", "SUPABASE_CONFIG_MISSING");
  }
  const response = await fetch(`${env.SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function telegram(env, method, body = {}) {
  if (!env.TELEGRAM_BOT_TOKEN) throw authError("AUTH_CONFIG_ERROR", "TELEGRAM_BOT_TOKEN_MISSING");
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description || "failed"}`);
  return data.result;
}

async function hmacPassword(env, telegramId) {
  if (!env.TELEGRAM_AUTH_SECRET) throw authError("AUTH_CONFIG_ERROR", "TELEGRAM_AUTH_SECRET_MISSING");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.TELEGRAM_AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(String(telegramId)));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "") + "N9!";
}

async function authAdmin(env, email, password, metadata) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: metadata }),
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_) {}
  return { ok: response.ok, status: response.status, data };
}

async function findAuthUser(env, email) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  const text = await response.text();
  if (!response.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase admin list ${response.status}: ${text}`);
  const data = JSON.parse(text);
  return (data.users || []).find((user) => user.email === email) || null;
}

async function createSession(env, email, password) {
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const text = await response.text();
  if (!response.ok) throw authError("AUTH_DATABASE_ERROR", `Supabase auth ${response.status}: ${text}`);
  return JSON.parse(text);
}

function telegramDisplay(user) {
  return String(
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || `user_${user.id}`
  ).slice(0, 80);
}

function telegramUsername(user) {
  const raw = String(user.username || `tg_${user.id}`).toLowerCase();
  const clean = raw.replace(/[^a-z0-9_]/g, "_").slice(0, 28);
  return clean.length >= 3 ? clean : `tg_${user.id}`.slice(0, 32);
}

async function ensureUser(env, tgUser, action) {
  const telegramId = String(tgUser.id);
  const email = `telegram_${telegramId}@accounts.nexora.local`;
  const password = await hmacPassword(env, telegramId);
  const displayName = telegramDisplay(tgUser);
  const username = telegramUsername(tgUser);

  const accounts = await sb(env, `/rest/v1/telegram_accounts?select=telegram_id,user_id,username,display_name&telegram_id=eq.${encodeURIComponent(telegramId)}&limit=1`);
  let userId = accounts[0]?.user_id || null;

  if (action === "login" && !userId) {
    const existing = await findAuthUser(env, email);
    if (!existing) throw authError("AUTH_ACCOUNT_NOT_FOUND");
    userId = existing.id;
  }

  if (action === "register" && userId) throw authError("AUTH_ACCOUNT_EXISTS");

  if (!userId) {
    const created = await authAdmin(env, email, password, {
      telegram_id: telegramId,
      telegram_username: tgUser.username || null,
    });
    if (created.ok) {
      userId = created.data?.id || null;
    } else if (created.status === 422 || /already|exists|duplicate/i.test(JSON.stringify(created.data || {}))) {
      const existing = await findAuthUser(env, email);
      if (!existing) throw authError("AUTH_DATABASE_ERROR", "Supabase user exists but cannot be resolved");
      if (action === "register") throw authError("AUTH_ACCOUNT_EXISTS");
      userId = existing.id;
    } else {
      throw authError("AUTH_DATABASE_ERROR", `Supabase admin ${created.status}: ${JSON.stringify(created.data || {})}`);
    }
  }

  if (!userId) throw authError("AUTH_DATABASE_ERROR", "Supabase admin did not return user id");

  const profiles = await sb(env, `/rest/v1/profiles?select=id,username,profile_type& id=eq.${encodeURIComponent(userId)}&limit=1`.replace("?select=id,username,profile_type& id", "?select=id,username,profile_type&id"));
  if (!profiles.length) {
    try {
      await sb(env, "/rest/v1/profiles", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          id: userId,
          username,
          display_name: displayName,
          profile_type: "user",
        }),
      });
    } catch (e) {
      const repaired = await sb(env, `/rest/v1/profiles?select=id& id=eq.${encodeURIComponent(userId)}&limit=1`.replace("?select=id& id", "?select=id&id"));
      if (!repaired.length) throw e;
    }
  } else {
    await sb(env, `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ display_name: displayName, updated_at: new Date().toISOString() }),
    });
  }

  await sb(env, "/rest/v1/telegram_accounts", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      telegram_id: Number(telegramId),
      user_id: userId,
      username: tgUser.username || null,
      display_name: displayName,
      avatar_url: null,
      updated_at: new Date().toISOString(),
    }),
  });

  return { userId, session: await createSession(env, email, password) };
}

async function patchChallenge(env, challenge, patch) {
  await sb(env, `/rest/v1/telegram_auth_challenges?challenge=eq.${encodeURIComponent(challenge)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
}

async function handleTelegramWebhook(request, env) {
  if (env.TELEGRAM_WEBHOOK_SECRET && request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== env.TELEGRAM_WEBHOOK_SECRET) {
    return json({ error: "forbidden" }, 403);
  }

  const update = await request.json();
  const message = update?.message;
  if (!message?.from || typeof message.text !== "string") return json({ ok: true });

  const match = message.text.trim().match(/^\/start(?:@[^\s]+)?(?:\s+([A-Za-z0-9_-]{20,64}))?$/);
  if (!match?.[1]) {
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "Добро пожаловать в Nexora. Откройте приложение и выберите «Войти» или «Регистрация».",
    });
    return json({ ok: true });
  }

  const challenge = match[1];
  const rows = await sb(env, `/rest/v1/telegram_auth_challenges?select=*&challenge=eq.${encodeURIComponent(challenge)}&status=eq.pending&limit=1`);
  if (!rows.length) {
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "Ссылка Nexora недействительна или уже использована. Начните авторизацию заново в приложении.",
    });
    return json({ ok: true });
  }

  const current = rows[0];
  if (new Date(current.expires_at).getTime() < Date.now()) {
    await patchChallenge(env, challenge, { status: "rejected" });
    await telegram(env, "sendMessage", { chat_id: message.chat.id, text: "Ссылка Nexora истекла. Начните авторизацию заново." });
    return json({ ok: true });
  }

  try {
    const result = await ensureUser(env, message.from, current.action);
    await patchChallenge(env, challenge, {
      status: "approved",
      telegram_id: message.from.id,
      telegram_username: message.from.username || null,
      display_name: telegramDisplay(message.from),
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    });
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: "Telegram подтверждён. Вернитесь в Nexora — вход будет завершён автоматически.",
    });
  } catch (error) {
    const code = classify(error);
    console.error("Telegram auth failed", {
      code,
      challenge,
      telegram_id: message.from.id,
      message: String(error?.message || error),
    });
    const text = {
      AUTH_CONFIG_ERROR: "Ошибка конфигурации Nexora. Обратитесь к администратору.",
      AUTH_DATABASE_ERROR: "Не удалось обратиться к серверу Nexora. Попробуйте ещё раз через некоторое время.",
      AUTH_ACCOUNT_EXISTS: "Аккаунт Nexora уже существует. Выберите «Войти» в приложении.",
      AUTH_ACCOUNT_NOT_FOUND: "Аккаунт Nexora ещё не зарегистрирован. Выберите «Регистрация» в приложении.",
    }[code] || "Не удалось завершить авторизацию. Попробуйте ещё раз.";

    await patchChallenge(env, challenge, { status: "rejected" }).catch(() => {});
    await telegram(env, "sendMessage", {
      chat_id: message.chat.id,
      text: `${text}\n\nКод: ${code}`,
    });
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/telegram/webhook" && request.method === "POST") {
      try {
        return await handleTelegramWebhook(request, env);
      } catch (error) {
        console.error("Telegram webhook fatal error", String(error?.message || error));
        return json({ ok: false }, 500);
      }
    }
    return legacy.fetch(request, env, ctx);
  },
};
