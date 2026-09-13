import { r as createServerFn } from "./ssr.mjs";
import { A as boolean, D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { o as createSsrRpc } from "./router-S7nrbCDI.mjs";
import { t as authMiddleware } from "./middleware-JJDVFfT8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-B9hw5f_v.js
var ensureMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("dcbbd217e3e234c5beb9ffdb0808f725bec201d3a54650457af73f54e23cc40b"));
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
var updateMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => profilePatch.parse(d)).handler(createSsrRpc("23ef8956401184bf9afcca84bb10df75dac2e98d6ab496039388affaaa80aa54"));
var getProfileByUsername = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ username: string() }).parse(d)).handler(createSsrRpc("3ae511396d1fa454f57b3a213ba5e06f975b01019f1747678f8c3040f6c1c6b2"));
var getFeed = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("f2643c436e6ba4efe57317eb3f6c54a74112d7d3decc6c537a4d48f01a7b7d11"));
var getBeats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("471c26c08cc368ed6e35bd35a64bba6e880075a2d89c69cbec5ba5df32161271"));
var getItem = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(createSsrRpc("db767e610c1171724fcb35cbfe8332be50635795ba28e60fafb7a86596beec53"));
var getLibrary = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ userId: string().optional() }).parse(d ?? {})).handler(createSsrRpc("811a7e219ba6dc5d184ec27cab1ebdee09b0b74942b6330ed954ace3a1ee8e5e"));
var randomItem = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	genre: string().optional()
}).parse(d)).handler(createSsrRpc("e950e5cfa25bd43ad917181a5be048e7cc8a976852dd0f1964b4c92a6db9c23c"));
var toggleLike = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(createSsrRpc("89f17fb948935d426b7ea79e10977da52b0a457d70b47de48375411be4631ec3"));
var listComments = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(createSsrRpc("6fd72345d38b7bf3432b11dd693263f12fc79991629119484f6bbc64efe88e10"));
var addComment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string(),
	body: string().min(1).max(500)
}).parse(d)).handler(createSsrRpc("98f8f2d5bb49fb059575efb03c72444197919914dfc15e472ccf8d88f9a1d3ba"));
var sendCollab = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	trackId: string(),
	message: string().max(400)
}).parse(d)).handler(createSsrRpc("c5abc7033dd248abe5fc1fdd4df8772523bd703889e6b98a6f7eccee404ee887"));
var sendOffer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	beatId: string(),
	message: string().max(400)
}).parse(d)).handler(createSsrRpc("5c25f6282519949a060aba30ee51e26ea773b5d884007fe5ee1b8a6a40f94237"));
var createLicense = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	beatId: string(),
	licenseType: _enum(["standard", "exclusive"]).default("standard")
}).parse(d)).handler(createSsrRpc("54f85fe475c642f3c8d39e4a19b0bcf17b78a750b64fe81f5cd3c66c18f36318"));
var listChats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("79334dd31cb3beb7fafecb97e7778652c9279bcf706604e7b5a6f2739c4ae4ad"));
var listMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ roomId: string() }).parse(d)).handler(createSsrRpc("468336e3e01c923b9916dc0f911dcead22a5d5275a43652d876ca295699cc686"));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	roomId: string(),
	body: string().min(1).max(1e3)
}).parse(d)).handler(createSsrRpc("66a70e0fde381d62b8a8adc7028f0e35f4bf757585da7924ebc79ec451da4945"));
var listRequests = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8255ff281202ad66cd844f3a2d14ab48febacf5ef2c53d5a3b8c748411f35bf0"));
var respondRequest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["collab", "offer"]),
	id: string(),
	accept: boolean()
}).parse(d)).handler(createSsrRpc("5df0638cf66b40c45def1ef6be9b1f2eab8f126ffa97a0a04cf02bc499ba8eed"));
var listOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8f0c35f2f03550ff98d239d9a4f4bbe6aad56cc78de917411da37b12ab3ce6f0"));
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
var publishItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => publishSchema.parse(d)).handler(createSsrRpc("4816d22313f42da0bb76115ec24ecc021db23b3bc8256d8890287af4ba9dd7f0"));
var deleteItem = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({
	kind: _enum(["track", "beat"]),
	id: string()
}).parse(d)).handler(createSsrRpc("6355c280b1cfec94697aa26960fbbb10ecd09e27fb82243359e06f6c217261f8"));
var toggleFollow = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((d) => object({ userId: string() }).parse(d)).handler(createSsrRpc("65644bcc2240533b7eae4da5103ea32d8700bbe81e764e6b2b4588bfc9f979e4"));
var followState = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((d) => object({ userId: string() }).parse(d)).handler(createSsrRpc("993db05d0f5637e43c9238e14fe826ea9a20434bcd60a0bb738946047d8e1f86"));
//#endregion
export { toggleLike as C, toggleFollow as S, randomItem as _, followState as a, sendMessage as b, getItem as c, listChats as d, listComments as f, publishItem as g, listRequests as h, ensureMyProfile as i, getLibrary as l, listOrders as m, createLicense as n, getBeats as o, listMessages as p, deleteItem as r, getFeed as s, addComment as t, getProfileByUsername as u, respondRequest as v, updateMyProfile as w, sendOffer as x, sendCollab as y };
