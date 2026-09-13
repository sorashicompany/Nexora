import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type {
  CatalogItem,
  CatalogKind,
  ChatMessage,
  ChatRoom,
  CommentRow,
  OrderRow,
  Profile,
  ProfileType,
  RequestRow,
} from "./types";

function nid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function codeFor(userId: string) {
  const n = Math.abs(
    userId.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7),
  );
  return `nx${String(100000 + (n % 900000))}`;
}

function slugFromId(userId: string) {
  const raw = userId.replace(/[^a-zA-Z0-9]/g, "").slice(-10) || "user";
  return `nx_${raw}`.slice(0, 24).toLowerCase();
}

function mapProfile(r: Record<string, unknown>): Profile {
  return {
    userId: String(r.user_id),
    username: String(r.username),
    displayName: String(r.display_name),
    bio: String(r.bio ?? ""),
    profileType: (r.profile_type as ProfileType) || "user",
    channel: r.channel ? String(r.channel) : null,
    profileCode: String(r.profile_code),
    createdAt: String(r.created_at),
  };
}

function mapTrack(r: Record<string, unknown>, liked: boolean): CatalogItem {
  return {
    id: String(r.id),
    kind: "track",
    ownerId: String(r.owner_id),
    username: String(r.username),
    displayName: String(r.display_name),
    profileType: (r.profile_type as ProfileType) || "artist",
    title: String(r.title),
    description: String(r.description ?? ""),
    genre: String(r.genre ?? ""),
    bpm: Number(r.bpm) || 0,
    musicalKey: String(r.musical_key ?? ""),
    audioKind: r.audio_kind === "upload" ? "upload" : "synth",
    audioSeed: r.audio_seed ? String(r.audio_seed) : null,
    audioData: r.audio_data ? String(r.audio_data) : null,
    priceCents: 0,
    published: Boolean(r.published),
    likeCount: Number(r.like_count) || 0,
    liked,
    createdAt: String(r.created_at),
  };
}

function mapBeat(r: Record<string, unknown>, liked: boolean): CatalogItem {
  return {
    id: String(r.id),
    kind: "beat",
    ownerId: String(r.beatmaker_id),
    username: String(r.username),
    displayName: String(r.display_name),
    profileType: (r.profile_type as ProfileType) || "beatmaker",
    title: String(r.title),
    description: String(r.description ?? ""),
    genre: String(r.genre ?? ""),
    bpm: Number(r.bpm) || 0,
    musicalKey: String(r.musical_key ?? ""),
    audioKind: r.audio_kind === "upload" ? "upload" : "synth",
    audioSeed: r.audio_seed ? String(r.audio_seed) : null,
    audioData: r.audio_data ? String(r.audio_data) : null,
    priceCents: Number(r.price_cents) || 0,
    published: Boolean(r.published),
    likeCount: Number(r.like_count) || 0,
    liked,
    createdAt: String(r.created_at),
  };
}

export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const existing = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
    if (existing[0]) return mapProfile(existing[0]);
    let username = slugFromId(context.userId);
    const clash = await sql`select 1 from profiles where username = ${username} limit 1`;
    if (clash[0]) username = `${username}${Math.floor(Math.random() * 90 + 10)}`;
    let profileCode = codeFor(context.userId);
    const codeClash = await sql`select 1 from profiles where profile_code = ${profileCode} limit 1`;
    if (codeClash[0]) profileCode = `nx${String(Math.floor(100000 + Math.random() * 900000))}`;
    await sql`
      insert into profiles (user_id, username, display_name, bio, profile_type, profile_code)
      values (${context.userId}, ${username}, ${"Nexora user"}, ${""}, ${"user"}, ${profileCode})
    `;
    const row = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
    return mapProfile(row[0]!);
  });

const profilePatch = z.object({
  username: z.string().min(3).max(32).optional(),
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(280).optional(),
  profileType: z.enum(["artist", "beatmaker", "user"]).optional(),
  channel: z.string().max(64).nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => profilePatch.parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.username) {
      const u = data.username.replace(/^@/, "").trim();
      if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(u)) throw new Error("Ник: 3–32 символа, латиница, цифры, _ - .");
      const taken = await sql`select 1 from profiles where username = ${u} and user_id <> ${context.userId} limit 1`;
      if (taken[0]) throw new Error("Этот ник уже занят");
      await sql`update profiles set username = ${u} where user_id = ${context.userId}`;
    }
    if (data.displayName !== undefined) {
      await sql`update profiles set display_name = ${data.displayName.trim()} where user_id = ${context.userId}`;
    }
    if (data.bio !== undefined) {
      await sql`update profiles set bio = ${data.bio} where user_id = ${context.userId}`;
    }
    if (data.profileType !== undefined) {
      await sql`update profiles set profile_type = ${data.profileType} where user_id = ${context.userId}`;
    }
    if (data.channel !== undefined) {
      await sql`update profiles set channel = ${data.channel} where user_id = ${context.userId}`;
    }
    const row = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
    return mapProfile(row[0]!);
  });

export const getProfileByUsername = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ username: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const row = await sql`select * from profiles where username = ${data.username} limit 1`;
    return row[0] ? mapProfile(row[0]) : null;
  });

const TRACK_SELECT = `select
  t.id, t.owner_id, t.title, t.description, t.genre, t.bpm, t.musical_key,
  t.audio_kind, t.audio_seed, t.audio_data, t.published, t.created_at,
  p.username, p.display_name, p.profile_type,
  (select count(*)::int from track_likes l where l.track_id = t.id) as like_count,
  (select count(*)::int from track_likes l where l.track_id = t.id and l.user_id = $1) as liked_me
`;

const BEAT_SELECT = `select
  b.id, b.beatmaker_id, b.title, b.description, b.genre, b.bpm, b.musical_key,
  b.audio_kind, b.audio_seed, b.audio_data, b.price_cents, b.published, b.created_at,
  p.username, p.display_name, p.profile_type,
  (select count(*)::int from beat_likes l where l.beat_id = b.id) as like_count,
  (select count(*)::int from beat_likes l where l.beat_id = b.id and l.user_id = $1) as liked_me
`;

export const getFeed = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const tracks = await sql.query(`${TRACK_SELECT}
      from tracks t join profiles p on p.user_id = t.owner_id
      where t.published = true
      order by t.created_at desc limit 50`, [context.userId]);
    return tracks.map((r) => mapTrack(r, Number(r.liked_me) > 0));
  });

export const getBeats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const beats = await sql.query(`${BEAT_SELECT}
      from beats b join profiles p on p.user_id = b.beatmaker_id
      where b.published = true
      order by b.created_at desc limit 50`, [context.userId]);
    return beats.map((r) => mapBeat(r, Number(r.liked_me) > 0));
  });

export const getItem = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ kind: z.enum(["track", "beat"]), id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.kind === "track") {
      const rows = await sql.query(`${TRACK_SELECT}
        from tracks t join profiles p on p.user_id = t.owner_id
        where t.id = $2 limit 1`, [context.userId, data.id]);
      return rows[0] ? mapTrack(rows[0], Number(rows[0].liked_me) > 0) : null;
    }
    const rows = await sql.query(`${BEAT_SELECT}
      from beats b join profiles p on p.user_id = b.beatmaker_id
      where b.id = $2 limit 1`, [context.userId, data.id]);
    return rows[0] ? mapBeat(rows[0], Number(rows[0].liked_me) > 0) : null;
  });

export const getLibrary = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ userId: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const uid = data.userId || context.userId;
    const tracks = await sql.query(`${TRACK_SELECT}
      from tracks t join profiles p on p.user_id = t.owner_id
      where t.owner_id = $2
      order by t.created_at desc`, [context.userId, uid]);
    const beats = await sql.query(`${BEAT_SELECT}
      from beats b join profiles p on p.user_id = b.beatmaker_id
      where b.beatmaker_id = $2
      order by b.created_at desc`, [context.userId, uid]);
    return {
      tracks: tracks.map((r) => mapTrack(r, Number(r.liked_me) > 0)),
      beats: beats.map((r) => mapBeat(r, Number(r.liked_me) > 0)),
    };
  });

export const randomItem = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ kind: z.enum(["track", "beat"]), genre: z.string().optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const genre = data.genre?.trim();
    if (data.kind === "track") {
      const rows = genre
        ? await sql.query(`${TRACK_SELECT}
            from tracks t join profiles p on p.user_id = t.owner_id
            where t.published = true and t.owner_id <> $1 and t.genre ilike $2`, [context.userId, `%${genre}%`])
        : await sql.query(`${TRACK_SELECT}
            from tracks t join profiles p on p.user_id = t.owner_id
            where t.published = true and t.owner_id <> $1`, [context.userId]);
      if (!rows.length) return null;
      const pick = rows[Math.floor(Math.random() * rows.length)]!;
      return mapTrack(pick, Number(pick.liked_me) > 0);
    }
    const rows = genre
      ? await sql.query(`${BEAT_SELECT}
          from beats b join profiles p on p.user_id = b.beatmaker_id
          where b.published = true and b.beatmaker_id <> $1 and b.genre ilike $2`, [context.userId, `%${genre}%`])
      : await sql.query(`${BEAT_SELECT}
          from beats b join profiles p on p.user_id = b.beatmaker_id
          where b.published = true and b.beatmaker_id <> $1`, [context.userId]);
    if (!rows.length) return null;
    const pick = rows[Math.floor(Math.random() * rows.length)]!;
    return mapBeat(pick, Number(pick.liked_me) > 0);
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ kind: z.enum(["track", "beat"]), id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.kind === "track") {
      const hit = await sql`select 1 from track_likes where user_id = ${context.userId} and track_id = ${data.id}`;
      if (hit[0]) await sql`delete from track_likes where user_id = ${context.userId} and track_id = ${data.id}`;
      else await sql`insert into track_likes (user_id, track_id) values (${context.userId}, ${data.id})`;
      const c = await sql`select count(*)::int as n from track_likes where track_id = ${data.id}`;
      return { liked: !hit[0], likeCount: Number(c[0]?.n) || 0 };
    }
    const hit = await sql`select 1 from beat_likes where user_id = ${context.userId} and beat_id = ${data.id}`;
    if (hit[0]) await sql`delete from beat_likes where user_id = ${context.userId} and beat_id = ${data.id}`;
    else await sql`insert into beat_likes (user_id, beat_id) values (${context.userId}, ${data.id})`;
    const c = await sql`select count(*)::int as n from beat_likes where beat_id = ${data.id}`;
    return { liked: !hit[0], likeCount: Number(c[0]?.n) || 0 };
  });

export const listComments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ kind: z.enum(["track", "beat"]), id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql`
      select c.id, c.user_id, c.body, c.created_at, p.username, p.display_name
      from comments c join profiles p on p.user_id = c.user_id
      where c.target_kind = ${data.kind} and c.target_id = ${data.id}
      order by c.created_at asc
    `;
    return rows.map(
      (r): CommentRow => ({
        id: String(r.id),
        userId: String(r.user_id),
        username: String(r.username),
        displayName: String(r.display_name),
        body: String(r.body),
        createdAt: String(r.created_at),
      }),
    );
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ kind: z.enum(["track", "beat"]), id: z.string(), body: z.string().min(1).max(500) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = nid("cmt");
    await sql`
      insert into comments (id, user_id, target_kind, target_id, body)
      values (${id}, ${context.userId}, ${data.kind}, ${data.id}, ${data.body.trim()})
    `;
    return { ok: true };
  });

async function findOrCreateChat(sql: Awaited<ReturnType<typeof getSql>>, me: string, other: string, title: string) {
  const existing = await sql`
    select a.room_id as id from chat_members a
    join chat_members b on a.room_id = b.room_id
    where a.user_id = ${me} and b.user_id = ${other}
    limit 1
  `;
  if (existing[0]) return String(existing[0].id);
  const id = nid("room");
  await sql`insert into chat_rooms (id, title) values (${id}, ${title})`;
  await sql`insert into chat_members (room_id, user_id) values (${id}, ${me})`;
  await sql`insert into chat_members (room_id, user_id) values (${id}, ${other})`;
  return id;
}

export const sendCollab = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ trackId: z.string(), message: z.string().max(400) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const t = await sql`select id, owner_id, title from tracks where id = ${data.trackId} limit 1`;
    if (!t[0]) throw new Error("Демка не найдена");
    const owner = String(t[0].owner_id);
    if (owner === context.userId) throw new Error("Нельзя отправить коллаб себе");
    const id = nid("col");
    await sql`
      insert into collab_requests (id, track_id, sender_id, receiver_id, message)
      values (${id}, ${data.trackId}, ${context.userId}, ${owner}, ${data.message.trim()})
    `;
    const roomId = await findOrCreateChat(sql, context.userId, owner, "Music collaboration");
    if (data.message.trim()) {
      await sql`
        insert into messages (id, room_id, sender_id, body)
        values (${nid("msg")}, ${roomId}, ${context.userId}, ${data.message.trim()})
      `;
    }
    return { roomId };
  });

export const sendOffer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ beatId: z.string(), message: z.string().max(400) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const t = await sql`select id, beatmaker_id, title from beats where id = ${data.beatId} limit 1`;
    if (!t[0]) throw new Error("Бит не найден");
    const owner = String(t[0].beatmaker_id);
    if (owner === context.userId) throw new Error("Нельзя предложить бит себе");
    const id = nid("off");
    await sql`
      insert into beat_offers (id, beat_id, sender_id, receiver_id, message)
      values (${id}, ${data.beatId}, ${context.userId}, ${owner}, ${data.message.trim()})
    `;
    const roomId = await findOrCreateChat(sql, context.userId, owner, "Beat collaboration");
    if (data.message.trim()) {
      await sql`
        insert into messages (id, room_id, sender_id, body)
        values (${nid("msg")}, ${roomId}, ${context.userId}, ${data.message.trim()})
      `;
    }
    return { roomId };
  });

export const createLicense = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z.object({ beatId: z.string(), licenseType: z.enum(["standard", "exclusive"]).default("standard") }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const t = await sql`select id, beatmaker_id, title, price_cents from beats where id = ${data.beatId} limit 1`;
    if (!t[0]) throw new Error("Бит не найден");
    const seller = String(t[0].beatmaker_id);
    if (seller === context.userId) throw new Error("Нельзя лицензировать свой бит");
    const id = nid("ord");
    const price = Number(t[0].price_cents) || 0;
    await sql`
      insert into beat_orders (id, beat_id, buyer_id, seller_id, license_type, price_cents, status)
      values (${id}, ${data.beatId}, ${context.userId}, ${seller}, ${data.licenseType}, ${price}, ${"pending"})
    `;
    return { id, status: "pending" as const };
  });

export const listChats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`
      select r.id, r.title, o.user_id as other_id, p.username, p.display_name,
        (select m.body from messages m where m.room_id = r.id order by m.created_at desc limit 1) as last_body,
        (select m.created_at from messages m where m.room_id = r.id order by m.created_at desc limit 1) as last_at
      from chat_members mine
      join chat_rooms r on r.id = mine.room_id
      join chat_members o on o.room_id = r.id and o.user_id <> ${context.userId}
      join profiles p on p.user_id = o.user_id
      where mine.user_id = ${context.userId}
      order by coalesce(
        (select m.created_at from messages m where m.room_id = r.id order by m.created_at desc limit 1),
        r.created_at
      ) desc
    `;
    return rows.map(
      (r): ChatRoom => ({
        id: String(r.id),
        title: String(r.title),
        otherUserId: String(r.other_id),
        otherUsername: String(r.username),
        otherDisplayName: String(r.display_name),
        lastBody: r.last_body ? String(r.last_body) : null,
        lastAt: r.last_at ? String(r.last_at) : null,
      }),
    );
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ roomId: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await sql`
      select 1 from chat_members where room_id = ${data.roomId} and user_id = ${context.userId}
    `;
    if (!member[0]) throw new Error("Нет доступа к чату");
    const rows = await sql`
      select id, room_id, sender_id, body, created_at
      from messages where room_id = ${data.roomId}
      order by created_at asc limit 200
    `;
    return rows.map(
      (r): ChatMessage => ({
        id: String(r.id),
        roomId: String(r.room_id),
        senderId: String(r.sender_id),
        body: String(r.body),
        createdAt: String(r.created_at),
      }),
    );
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ roomId: z.string(), body: z.string().min(1).max(1000) }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await sql`
      select 1 from chat_members where room_id = ${data.roomId} and user_id = ${context.userId}
    `;
    if (!member[0]) throw new Error("Нет доступа к чату");
    const id = nid("msg");
    await sql`
      insert into messages (id, room_id, sender_id, body)
      values (${id}, ${data.roomId}, ${context.userId}, ${data.body.trim()})
    `;
    return { id };
  });

export const listRequests = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const collabs = await sql`
      select c.id, c.track_id as item_id, t.title as item_title, c.message, c.status, c.created_at,
        c.sender_id, c.receiver_id,
        case when c.receiver_id = ${context.userId} then sp.username else rp.username end as counterpart
      from collab_requests c
      join tracks t on t.id = c.track_id
      join profiles sp on sp.user_id = c.sender_id
      join profiles rp on rp.user_id = c.receiver_id
      where c.sender_id = ${context.userId} or c.receiver_id = ${context.userId}
      order by c.created_at desc
    `;
    const offers = await sql`
      select o.id, o.beat_id as item_id, b.title as item_title, o.message, o.status, o.created_at,
        o.sender_id, o.receiver_id,
        case when o.receiver_id = ${context.userId} then sp.username else rp.username end as counterpart
      from beat_offers o
      join beats b on b.id = o.beat_id
      join profiles sp on sp.user_id = o.sender_id
      join profiles rp on rp.user_id = o.receiver_id
      where o.sender_id = ${context.userId} or o.receiver_id = ${context.userId}
      order by o.created_at desc
    `;
    const map = (r: Record<string, unknown>, kind: "collab" | "offer"): RequestRow => ({
      id: String(r.id),
      kind,
      itemId: String(r.item_id),
      itemTitle: String(r.item_title),
      counterpartId: String(r.receiver_id) === context.userId ? String(r.sender_id) : String(r.receiver_id),
      counterpartUsername: String(r.counterpart),
      message: String(r.message ?? ""),
      status: String(r.status),
      incoming: String(r.receiver_id) === context.userId,
      createdAt: String(r.created_at),
    });
    return {
      collabs: collabs.map((r) => map(r, "collab")),
      offers: offers.map((r) => map(r, "offer")),
    };
  });

export const respondRequest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) =>
    z
      .object({
        kind: z.enum(["collab", "offer"]),
        id: z.string(),
        accept: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const status = data.accept ? "accepted" : "declined";
    if (data.kind === "collab") {
      await sql`
        update collab_requests set status = ${status}
        where id = ${data.id} and receiver_id = ${context.userId}
      `;
    } else {
      await sql`
        update beat_offers set status = ${status}
        where id = ${data.id} and receiver_id = ${context.userId}
      `;
    }
    return { status };
  });

export const listOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql`
      select o.id, o.beat_id, b.title as beat_title, o.license_type, o.price_cents, o.status, o.created_at,
        o.buyer_id, o.seller_id,
        case when o.buyer_id = ${context.userId} then sp.username else bp.username end as counterpart
      from beat_orders o
      join beats b on b.id = o.beat_id
      join profiles bp on bp.user_id = o.buyer_id
      join profiles sp on sp.user_id = o.seller_id
      where o.buyer_id = ${context.userId} or o.seller_id = ${context.userId}
      order by o.created_at desc
    `;
    return rows.map(
      (r): OrderRow => ({
        id: String(r.id),
        beatId: String(r.beat_id),
        beatTitle: String(r.beat_title),
        counterpartUsername: String(r.counterpart),
        licenseType: String(r.license_type),
        priceCents: Number(r.price_cents) || 0,
        status: String(r.status),
        incoming: String(r.seller_id) === context.userId,
        createdAt: String(r.created_at),
      }),
    );
  });

const publishSchema = z.object({
  kind: z.enum(["track", "beat"]),
  title: z.string().min(1).max(160),
  genre: z.string().max(80),
  bpm: z.number().int().min(0).max(300),
  musicalKey: z.string().max(12),
  description: z.string().max(400).optional(),
  priceEuro: z.number().min(0).max(9999).optional(),
  audioKind: z.enum(["synth", "upload"]),
  audioSeed: z.string().max(80).optional(),
  audioData: z.string().max(2_200_000).optional(),
});

export const publishItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => publishSchema.parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
    if (!me[0]) throw new Error("Сначала завершите профиль");
    const id = nid(data.kind === "track" ? "track" : "beat");
    const seed = data.audioSeed || id;
    if (data.kind === "track") {
      await sql`
        insert into tracks (id, owner_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, audio_data, published)
        values (${id}, ${context.userId}, ${data.title.trim()}, ${data.description ?? ""}, ${data.genre}, ${data.bpm}, ${data.musicalKey}, ${data.audioKind}, ${seed}, ${data.audioData ?? null}, ${true})
      `;
    } else {
      const cents = Math.round((data.priceEuro ?? 0) * 100);
      await sql`
        insert into beats (id, beatmaker_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, audio_data, price_cents, published)
        values (${id}, ${context.userId}, ${data.title.trim()}, ${data.description ?? ""}, ${data.genre}, ${data.bpm}, ${data.musicalKey}, ${data.audioKind}, ${seed}, ${data.audioData ?? null}, ${cents}, ${true})
      `;
    }
    return { id };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ kind: z.enum(["track", "beat"]), id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.kind === "track") {
      await sql`delete from tracks where id = ${data.id} and owner_id = ${context.userId}`;
    } else {
      await sql`delete from beats where id = ${data.id} and beatmaker_id = ${context.userId}`;
    }
    return { ok: true };
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    if (data.userId === context.userId) throw new Error("Нельзя подписаться на себя");
    const sql = await getSql();
    const hit = await sql`
      select 1 from follows where follower_id = ${context.userId} and followee_id = ${data.userId}
    `;
    if (hit[0]) {
      await sql`delete from follows where follower_id = ${context.userId} and followee_id = ${data.userId}`;
      return { following: false };
    }
    await sql`insert into follows (follower_id, followee_id) values (${context.userId}, ${data.userId})`;
    return { following: true };
  });

export const followState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const hit = await sql`
      select 1 from follows where follower_id = ${context.userId} and followee_id = ${data.userId}
    `;
    const fans = await sql`select count(*)::int as n from follows where followee_id = ${data.userId}`;
    return { following: Boolean(hit[0]), fans: Number(fans[0]?.n) || 0 };
  });

export type { CatalogItem, CatalogKind };
