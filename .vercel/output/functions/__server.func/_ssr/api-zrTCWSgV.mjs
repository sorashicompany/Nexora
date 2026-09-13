import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-LQnsVU2n.mjs";
import { t as authMiddleware } from "./middleware-JJDVFfT8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-zrTCWSgV.js
function nid(prefix) {
	return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}
function codeFor(userId) {
	const n = Math.abs(userId.split("").reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7));
	return `nx${String(1e5 + n % 9e5)}`;
}
function slugFromId(userId) {
	return `nx_${userId.replace(/[^a-zA-Z0-9]/g, "").slice(-10) || "user"}`.slice(0, 24).toLowerCase();
}
function mapProfile(r) {
	return {
		userId: String(r.user_id),
		username: String(r.username),
		displayName: String(r.display_name),
		bio: String(r.bio ?? ""),
		profileType: r.profile_type || "user",
		channel: r.channel ? String(r.channel) : null,
		profileCode: String(r.profile_code),
		createdAt: String(r.created_at)
	};
}
function mapTrack(r, liked) {
	return {
		id: String(r.id),
		kind: "track",
		ownerId: String(r.owner_id),
		username: String(r.username),
		displayName: String(r.display_name),
		profileType: r.profile_type || "artist",
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
		createdAt: String(r.created_at)
	};
}
function mapBeat(r, liked) {
	return {
		id: String(r.id),
		kind: "beat",
		ownerId: String(r.beatmaker_id),
		username: String(r.username),
		displayName: String(r.display_name),
		profileType: r.profile_type || "beatmaker",
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
		createdAt: String(r.created_at)
	};
}
var ensureMyProfile_createServerFn_handler = createServerRpc({
	id: "dcbbd217e3e234c5beb9ffdb0808f725bec201d3a54650457af73f54e23cc40b",
	name: "ensureMyProfile",
	filename: "src/lib/nexora/api.ts"
}, (opts) => ensureMyProfile.__executeServer(opts));
var ensureMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(ensureMyProfile_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const existing = await sql`select * from profiles where user_id = ${context.userId} limit 1`;
	if (existing[0]) return mapProfile(existing[0]);
	let username = slugFromId(context.userId);
	if ((await sql`select 1 from profiles where username = ${username} limit 1`)[0]) username = `${username}${Math.floor(Math.random() * 90 + 10)}`;
	let profileCode = codeFor(context.userId);
	if ((await sql`select 1 from profiles where profile_code = ${profileCode} limit 1`)[0]) profileCode = `nx${String(Math.floor(1e5 + Math.random() * 9e5))}`;
	await sql`
      insert into profiles (user_id, username, display_name, bio, profile_type, profile_code)
      values (${context.userId}, ${username}, ${"Nexora user"}, ${""}, ${"user"}, ${profileCode})
    `;
	return mapProfile((await sql`select * from profiles where user_id = ${context.userId} limit 1`)[0]);
});
var profilePatch = object({
	username: string().min(3).max(32).optional(),
	displayName: string().min(1).max(80).optional(),
	bio: string().max(280).optional(),
	profileType: _enum([
		"artist",
		"beatmaker",
		"user"
	]).optional(),
	channel: string().max(64).nullable().optional()
});
var updateMyProfile_createServerFn_handler = createServerRpc({
	id: "23ef8956401184bf9afcca84bb10df75dac2e98d6ab496039388affaaa80aa54",
	name: "updateMyProfile",
	filename: "src/lib/nexora/api.ts"
}, (opts) => updateMyProfile.__executeServer(opts));
var updateMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => profilePatch.parse(d)).handler(updateMyProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (data.username) {
		const u = data.username.replace(/^@/, "").trim();
		if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(u)) throw new Error("Ник: 3–32 символа, латиница, цифры, _ - .");
		if ((await sql`select 1 from profiles where username = ${u} and user_id <> ${context.userId} limit 1`)[0]) throw new Error("Этот ник уже занят");
		await sql`update profiles set username = ${u} where user_id = ${context.userId}`;
	}
	if (data.displayName !== void 0) await sql`update profiles set display_name = ${data.displayName.trim()} where user_id = ${context.userId}`;
	if (data.bio !== void 0) await sql`update profiles set bio = ${data.bio} where user_id = ${context.userId}`;
	if (data.profileType !== void 0) await sql`update profiles set profile_type = ${data.profileType} where user_id = ${context.userId}`;
	if (data.channel !== void 0) await sql`update profiles set channel = ${data.channel} where user_id = ${context.userId}`;
	return mapProfile((await sql`select * from profiles where user_id = ${context.userId} limit 1`)[0]);
});
var getProfileByUsername_createServerFn_handler = createServerRpc({
	id: "3ae511396d1fa454f57b3a213ba5e06f975b01019f1747678f8c3040f6c1c6b2",
	name: "getProfileByUsername",
	filename: "src/lib/nexora/api.ts"
}, (opts) => getProfileByUsername.__executeServer(opts));
var getProfileByUsername = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ username: string() }).parse(d)).handler(getProfileByUsername_createServerFn_handler, async ({ data }) => {
	const row = await (await getSql())`select * from profiles where username = ${data.username} limit 1`;
	return row[0] ? mapProfile(row[0]) : null;
});
var TRACK_SELECT = `select
  t.id, t.owner_id, t.title, t.description, t.genre, t.bpm, t.musical_key,
  t.audio_kind, t.audio_seed, t.audio_data, t.published, t.created_at,
  p.username, p.display_name, p.profile_type,
  (select count(*)::int from track_likes l where l.track_id = t.id) as like_count,
  (select count(*)::int from track_likes l where l.track_id = t.id and l.user_id = $1) as liked_me
`;
var BEAT_SELECT = `select
  b.id, b.beatmaker_id, b.title, b.description, b.genre, b.bpm, b.musical_key,
  b.audio_kind, b.audio_seed, b.audio_data, b.price_cents, b.published, b.created_at,
  p.username, p.display_name, p.profile_type,
  (select count(*)::int from beat_likes l where l.beat_id = b.id) as like_count,
  (select count(*)::int from beat_likes l where l.beat_id = b.id and l.user_id = $1) as liked_me
`;
var getFeed_createServerFn_handler = createServerRpc({
	id: "f2643c436e6ba4efe57317eb3f6c54a74112d7d3decc6c537a4d48f01a7b7d11",
	name: "getFeed",
	filename: "src/lib/nexora/api.ts"
}, (opts) => getFeed.__executeServer(opts));
var getFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getFeed_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`${TRACK_SELECT}
      from tracks t join profiles p on p.user_id = t.owner_id
      where t.published = true
      order by t.created_at desc limit 50`, [context.userId])).map((r) => mapTrack(r, Number(r.liked_me) > 0));
});
var getBeats_createServerFn_handler = createServerRpc({
	id: "471c26c08cc368ed6e35bd35a64bba6e880075a2d89c69cbec5ba5df32161271",
	name: "getBeats",
	filename: "src/lib/nexora/api.ts"
}, (opts) => getBeats.__executeServer(opts));
var getBeats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getBeats_createServerFn_handler, async ({ context }) => {
	return (await (await getSql()).query(`${BEAT_SELECT}
      from beats b join profiles p on p.user_id = b.beatmaker_id
      where b.published = true
      order by b.created_at desc limit 50`, [context.userId])).map((r) => mapBeat(r, Number(r.liked_me) > 0));
});
var getItem_createServerFn_handler = createServerRpc({
	id: "db767e610c1171724fcb35cbfe8332be50635795ba28e60fafb7a86596beec53",
	name: "getItem",
	filename: "src/lib/nexora/api.ts"
}, (opts) => getItem.__executeServer(opts));
var getItem = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(getItem_createServerFn_handler, async ({ context, data }) => {
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
var getLibrary_createServerFn_handler = createServerRpc({
	id: "811a7e219ba6dc5d184ec27cab1ebdee09b0b74942b6330ed954ace3a1ee8e5e",
	name: "getLibrary",
	filename: "src/lib/nexora/api.ts"
}, (opts) => getLibrary.__executeServer(opts));
var getLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ userId: string().optional() }).parse(d ?? {})).handler(getLibrary_createServerFn_handler, async ({ context, data }) => {
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
		beats: beats.map((r) => mapBeat(r, Number(r.liked_me) > 0))
	};
});
var randomItem_createServerFn_handler = createServerRpc({
	id: "e950e5cfa25bd43ad917181a5be048e7cc8a976852dd0f1964b4c92a6db9c23c",
	name: "randomItem",
	filename: "src/lib/nexora/api.ts"
}, (opts) => randomItem.__executeServer(opts));
var randomItem = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	genre: string().optional()
}).parse(d)).handler(randomItem_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const genre = data.genre?.trim();
	if (data.kind === "track") {
		const rows = genre ? await sql.query(`${TRACK_SELECT}
            from tracks t join profiles p on p.user_id = t.owner_id
            where t.published = true and t.owner_id <> $1 and t.genre ilike $2`, [context.userId, `%${genre}%`]) : await sql.query(`${TRACK_SELECT}
            from tracks t join profiles p on p.user_id = t.owner_id
            where t.published = true and t.owner_id <> $1`, [context.userId]);
		if (!rows.length) return null;
		const pick = rows[Math.floor(Math.random() * rows.length)];
		return mapTrack(pick, Number(pick.liked_me) > 0);
	}
	const rows = genre ? await sql.query(`${BEAT_SELECT}
          from beats b join profiles p on p.user_id = b.beatmaker_id
          where b.published = true and b.beatmaker_id <> $1 and b.genre ilike $2`, [context.userId, `%${genre}%`]) : await sql.query(`${BEAT_SELECT}
          from beats b join profiles p on p.user_id = b.beatmaker_id
          where b.published = true and b.beatmaker_id <> $1`, [context.userId]);
	if (!rows.length) return null;
	const pick = rows[Math.floor(Math.random() * rows.length)];
	return mapBeat(pick, Number(pick.liked_me) > 0);
});
var toggleLike_createServerFn_handler = createServerRpc({
	id: "89f17fb948935d426b7ea79e10977da52b0a457d70b47de48375411be4631ec3",
	name: "toggleLike",
	filename: "src/lib/nexora/api.ts"
}, (opts) => toggleLike.__executeServer(opts));
var toggleLike = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(toggleLike_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (data.kind === "track") {
		const hit = await sql`select 1 from track_likes where user_id = ${context.userId} and track_id = ${data.id}`;
		if (hit[0]) await sql`delete from track_likes where user_id = ${context.userId} and track_id = ${data.id}`;
		else await sql`insert into track_likes (user_id, track_id) values (${context.userId}, ${data.id})`;
		const c = await sql`select count(*)::int as n from track_likes where track_id = ${data.id}`;
		return {
			liked: !hit[0],
			likeCount: Number(c[0]?.n) || 0
		};
	}
	const hit = await sql`select 1 from beat_likes where user_id = ${context.userId} and beat_id = ${data.id}`;
	if (hit[0]) await sql`delete from beat_likes where user_id = ${context.userId} and beat_id = ${data.id}`;
	else await sql`insert into beat_likes (user_id, beat_id) values (${context.userId}, ${data.id})`;
	const c = await sql`select count(*)::int as n from beat_likes where beat_id = ${data.id}`;
	return {
		liked: !hit[0],
		likeCount: Number(c[0]?.n) || 0
	};
});
var listComments_createServerFn_handler = createServerRpc({
	id: "6fd72345d38b7bf3432b11dd693263f12fc79991629119484f6bbc64efe88e10",
	name: "listComments",
	filename: "src/lib/nexora/api.ts"
}, (opts) => listComments.__executeServer(opts));
var listComments = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(listComments_createServerFn_handler, async ({ data }) => {
	return (await (await getSql())`
      select c.id, c.user_id, c.body, c.created_at, p.username, p.display_name
      from comments c join profiles p on p.user_id = c.user_id
      where c.target_kind = ${data.kind} and c.target_id = ${data.id}
      order by c.created_at asc
    `).map((r) => ({
		id: String(r.id),
		userId: String(r.user_id),
		username: String(r.username),
		displayName: String(r.display_name),
		body: String(r.body),
		createdAt: String(r.created_at)
	}));
});
var addComment_createServerFn_handler = createServerRpc({
	id: "98f8f2d5bb49fb059575efb03c72444197919914dfc15e472ccf8d88f9a1d3ba",
	name: "addComment",
	filename: "src/lib/nexora/api.ts"
}, (opts) => addComment.__executeServer(opts));
var addComment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string(),
	body: string().min(1).max(500)
}).parse(d)).handler(addComment_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      insert into comments (id, user_id, target_kind, target_id, body)
      values (${nid("cmt")}, ${context.userId}, ${data.kind}, ${data.id}, ${data.body.trim()})
    `;
	return { ok: true };
});
async function findOrCreateChat(sql, me, other, title) {
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
var sendCollab_createServerFn_handler = createServerRpc({
	id: "c5abc7033dd248abe5fc1fdd4df8772523bd703889e6b98a6f7eccee404ee887",
	name: "sendCollab",
	filename: "src/lib/nexora/api.ts"
}, (opts) => sendCollab.__executeServer(opts));
var sendCollab = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	trackId: string(),
	message: string().max(400)
}).parse(d)).handler(sendCollab_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const t = await sql`select id, owner_id, title from tracks where id = ${data.trackId} limit 1`;
	if (!t[0]) throw new Error("Демка не найдена");
	const owner = String(t[0].owner_id);
	if (owner === context.userId) throw new Error("Нельзя отправить коллаб себе");
	await sql`
      insert into collab_requests (id, track_id, sender_id, receiver_id, message)
      values (${nid("col")}, ${data.trackId}, ${context.userId}, ${owner}, ${data.message.trim()})
    `;
	const roomId = await findOrCreateChat(sql, context.userId, owner, "Music collaboration");
	if (data.message.trim()) await sql`
        insert into messages (id, room_id, sender_id, body)
        values (${nid("msg")}, ${roomId}, ${context.userId}, ${data.message.trim()})
      `;
	return { roomId };
});
var sendOffer_createServerFn_handler = createServerRpc({
	id: "5c25f6282519949a060aba30ee51e26ea773b5d884007fe5ee1b8a6a40f94237",
	name: "sendOffer",
	filename: "src/lib/nexora/api.ts"
}, (opts) => sendOffer.__executeServer(opts));
var sendOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	beatId: string(),
	message: string().max(400)
}).parse(d)).handler(sendOffer_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const t = await sql`select id, beatmaker_id, title from beats where id = ${data.beatId} limit 1`;
	if (!t[0]) throw new Error("Бит не найден");
	const owner = String(t[0].beatmaker_id);
	if (owner === context.userId) throw new Error("Нельзя предложить бит себе");
	await sql`
      insert into beat_offers (id, beat_id, sender_id, receiver_id, message)
      values (${nid("off")}, ${data.beatId}, ${context.userId}, ${owner}, ${data.message.trim()})
    `;
	const roomId = await findOrCreateChat(sql, context.userId, owner, "Beat collaboration");
	if (data.message.trim()) await sql`
        insert into messages (id, room_id, sender_id, body)
        values (${nid("msg")}, ${roomId}, ${context.userId}, ${data.message.trim()})
      `;
	return { roomId };
});
var createLicense_createServerFn_handler = createServerRpc({
	id: "54f85fe475c642f3c8d39e4a19b0bcf17b78a750b64fe81f5cd3c66c18f36318",
	name: "createLicense",
	filename: "src/lib/nexora/api.ts"
}, (opts) => createLicense.__executeServer(opts));
var createLicense = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	beatId: string(),
	licenseType: _enum(["standard", "exclusive"]).default("standard")
}).parse(d)).handler(createLicense_createServerFn_handler, async ({ context, data }) => {
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
	return {
		id,
		status: "pending"
	};
});
var listChats_createServerFn_handler = createServerRpc({
	id: "79334dd31cb3beb7fafecb97e7778652c9279bcf706604e7b5a6f2739c4ae4ad",
	name: "listChats",
	filename: "src/lib/nexora/api.ts"
}, (opts) => listChats.__executeServer(opts));
var listChats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listChats_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
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
    `).map((r) => ({
		id: String(r.id),
		title: String(r.title),
		otherUserId: String(r.other_id),
		otherUsername: String(r.username),
		otherDisplayName: String(r.display_name),
		lastBody: r.last_body ? String(r.last_body) : null,
		lastAt: r.last_at ? String(r.last_at) : null
	}));
});
var listMessages_createServerFn_handler = createServerRpc({
	id: "468336e3e01c923b9916dc0f911dcead22a5d5275a43652d876ca295699cc686",
	name: "listMessages",
	filename: "src/lib/nexora/api.ts"
}, (opts) => listMessages.__executeServer(opts));
var listMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ roomId: string() }).parse(d)).handler(listMessages_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select 1 from chat_members where room_id = ${data.roomId} and user_id = ${context.userId}
    `)[0]) throw new Error("Нет доступа к чату");
	return (await sql`
      select id, room_id, sender_id, body, created_at
      from messages where room_id = ${data.roomId}
      order by created_at asc limit 200
    `).map((r) => ({
		id: String(r.id),
		roomId: String(r.room_id),
		senderId: String(r.sender_id),
		body: String(r.body),
		createdAt: String(r.created_at)
	}));
});
var sendMessage_createServerFn_handler = createServerRpc({
	id: "66a70e0fde381d62b8a8adc7028f0e35f4bf757585da7924ebc79ec451da4945",
	name: "sendMessage",
	filename: "src/lib/nexora/api.ts"
}, (opts) => sendMessage.__executeServer(opts));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	roomId: string(),
	body: string().min(1).max(1e3)
}).parse(d)).handler(sendMessage_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`
      select 1 from chat_members where room_id = ${data.roomId} and user_id = ${context.userId}
    `)[0]) throw new Error("Нет доступа к чату");
	const id = nid("msg");
	await sql`
      insert into messages (id, room_id, sender_id, body)
      values (${id}, ${data.roomId}, ${context.userId}, ${data.body.trim()})
    `;
	return { id };
});
var listRequests_createServerFn_handler = createServerRpc({
	id: "8255ff281202ad66cd844f3a2d14ab48febacf5ef2c53d5a3b8c748411f35bf0",
	name: "listRequests",
	filename: "src/lib/nexora/api.ts"
}, (opts) => listRequests.__executeServer(opts));
var listRequests = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listRequests_createServerFn_handler, async ({ context }) => {
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
	const map = (r, kind) => ({
		id: String(r.id),
		kind,
		itemId: String(r.item_id),
		itemTitle: String(r.item_title),
		counterpartId: String(r.receiver_id) === context.userId ? String(r.sender_id) : String(r.receiver_id),
		counterpartUsername: String(r.counterpart),
		message: String(r.message ?? ""),
		status: String(r.status),
		incoming: String(r.receiver_id) === context.userId,
		createdAt: String(r.created_at)
	});
	return {
		collabs: collabs.map((r) => map(r, "collab")),
		offers: offers.map((r) => map(r, "offer"))
	};
});
var respondRequest_createServerFn_handler = createServerRpc({
	id: "5df0638cf66b40c45def1ef6be9b1f2eab8f126ffa97a0a04cf02bc499ba8eed",
	name: "respondRequest",
	filename: "src/lib/nexora/api.ts"
}, (opts) => respondRequest.__executeServer(opts));
var respondRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["collab", "offer"]),
	id: string(),
	accept: boolean()
}).parse(d)).handler(respondRequest_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const status = data.accept ? "accepted" : "declined";
	if (data.kind === "collab") await sql`
        update collab_requests set status = ${status}
        where id = ${data.id} and receiver_id = ${context.userId}
      `;
	else await sql`
        update beat_offers set status = ${status}
        where id = ${data.id} and receiver_id = ${context.userId}
      `;
	return { status };
});
var listOrders_createServerFn_handler = createServerRpc({
	id: "8f0c35f2f03550ff98d239d9a4f4bbe6aad56cc78de917411da37b12ab3ce6f0",
	name: "listOrders",
	filename: "src/lib/nexora/api.ts"
}, (opts) => listOrders.__executeServer(opts));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listOrders_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select o.id, o.beat_id, b.title as beat_title, o.license_type, o.price_cents, o.status, o.created_at,
        o.buyer_id, o.seller_id,
        case when o.buyer_id = ${context.userId} then sp.username else bp.username end as counterpart
      from beat_orders o
      join beats b on b.id = o.beat_id
      join profiles bp on bp.user_id = o.buyer_id
      join profiles sp on sp.user_id = o.seller_id
      where o.buyer_id = ${context.userId} or o.seller_id = ${context.userId}
      order by o.created_at desc
    `).map((r) => ({
		id: String(r.id),
		beatId: String(r.beat_id),
		beatTitle: String(r.beat_title),
		counterpartUsername: String(r.counterpart),
		licenseType: String(r.license_type),
		priceCents: Number(r.price_cents) || 0,
		status: String(r.status),
		incoming: String(r.seller_id) === context.userId,
		createdAt: String(r.created_at)
	}));
});
var publishSchema = object({
	kind: _enum(["track", "beat"]),
	title: string().min(1).max(160),
	genre: string().max(80),
	bpm: number().int().min(0).max(300),
	musicalKey: string().max(12),
	description: string().max(400).optional(),
	priceEuro: number().min(0).max(9999).optional(),
	audioKind: _enum(["synth", "upload"]),
	audioSeed: string().max(80).optional(),
	audioData: string().max(22e5).optional()
});
var publishItem_createServerFn_handler = createServerRpc({
	id: "4816d22313f42da0bb76115ec24ecc021db23b3bc8256d8890287af4ba9dd7f0",
	name: "publishItem",
	filename: "src/lib/nexora/api.ts"
}, (opts) => publishItem.__executeServer(opts));
var publishItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => publishSchema.parse(d)).handler(publishItem_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!(await sql`select * from profiles where user_id = ${context.userId} limit 1`)[0]) throw new Error("Сначала завершите профиль");
	const id = nid(data.kind === "track" ? "track" : "beat");
	const seed = data.audioSeed || id;
	if (data.kind === "track") await sql`
        insert into tracks (id, owner_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, audio_data, published)
        values (${id}, ${context.userId}, ${data.title.trim()}, ${data.description ?? ""}, ${data.genre}, ${data.bpm}, ${data.musicalKey}, ${data.audioKind}, ${seed}, ${data.audioData ?? null}, ${true})
      `;
	else {
		const cents = Math.round((data.priceEuro ?? 0) * 100);
		await sql`
        insert into beats (id, beatmaker_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, audio_data, price_cents, published)
        values (${id}, ${context.userId}, ${data.title.trim()}, ${data.description ?? ""}, ${data.genre}, ${data.bpm}, ${data.musicalKey}, ${data.audioKind}, ${seed}, ${data.audioData ?? null}, ${cents}, ${true})
      `;
	}
	return { id };
});
var deleteItem_createServerFn_handler = createServerRpc({
	id: "6355c280b1cfec94697aa26960fbbb10ecd09e27fb82243359e06f6c217261f8",
	name: "deleteItem",
	filename: "src/lib/nexora/api.ts"
}, (opts) => deleteItem.__executeServer(opts));
var deleteItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(deleteItem_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (data.kind === "track") await sql`delete from tracks where id = ${data.id} and owner_id = ${context.userId}`;
	else await sql`delete from beats where id = ${data.id} and beatmaker_id = ${context.userId}`;
	return { ok: true };
});
var toggleFollow_createServerFn_handler = createServerRpc({
	id: "65644bcc2240533b7eae4da5103ea32d8700bbe81e764e6b2b4588bfc9f979e4",
	name: "toggleFollow",
	filename: "src/lib/nexora/api.ts"
}, (opts) => toggleFollow.__executeServer(opts));
var toggleFollow = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({ userId: string() }).parse(d)).handler(toggleFollow_createServerFn_handler, async ({ context, data }) => {
	if (data.userId === context.userId) throw new Error("Нельзя подписаться на себя");
	const sql = await getSql();
	if ((await sql`
      select 1 from follows where follower_id = ${context.userId} and followee_id = ${data.userId}
    `)[0]) {
		await sql`delete from follows where follower_id = ${context.userId} and followee_id = ${data.userId}`;
		return { following: false };
	}
	await sql`insert into follows (follower_id, followee_id) values (${context.userId}, ${data.userId})`;
	return { following: true };
});
var followState_createServerFn_handler = createServerRpc({
	id: "993db05d0f5637e43c9238e14fe826ea9a20434bcd60a0bb738946047d8e1f86",
	name: "followState",
	filename: "src/lib/nexora/api.ts"
}, (opts) => followState.__executeServer(opts));
var followState = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ userId: string() }).parse(d)).handler(followState_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const hit = await sql`
      select 1 from follows where follower_id = ${context.userId} and followee_id = ${data.userId}
    `;
	const fans = await sql`select count(*)::int as n from follows where followee_id = ${data.userId}`;
	return {
		following: Boolean(hit[0]),
		fans: Number(fans[0]?.n) || 0
	};
});
//#endregion
export { addComment_createServerFn_handler, createLicense_createServerFn_handler, deleteItem_createServerFn_handler, ensureMyProfile_createServerFn_handler, followState_createServerFn_handler, getBeats_createServerFn_handler, getFeed_createServerFn_handler, getItem_createServerFn_handler, getLibrary_createServerFn_handler, getProfileByUsername_createServerFn_handler, listChats_createServerFn_handler, listComments_createServerFn_handler, listMessages_createServerFn_handler, listOrders_createServerFn_handler, listRequests_createServerFn_handler, publishItem_createServerFn_handler, randomItem_createServerFn_handler, respondRequest_createServerFn_handler, sendCollab_createServerFn_handler, sendMessage_createServerFn_handler, sendOffer_createServerFn_handler, toggleFollow_createServerFn_handler, toggleLike_createServerFn_handler, updateMyProfile_createServerFn_handler };
