export type ProfileType = "artist" | "beatmaker" | "user";

export type Profile = {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  profileType: ProfileType;
  channel: string | null;
  profileCode: string;
  createdAt: string;
};

export type CatalogKind = "track" | "beat";

export type CatalogItem = {
  id: string;
  kind: CatalogKind;
  ownerId: string;
  username: string;
  displayName: string;
  profileType: ProfileType;
  title: string;
  description: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  audioKind: "synth" | "upload";
  audioSeed: string | null;
  audioData: string | null;
  priceCents: number;
  published: boolean;
  likeCount: number;
  liked: boolean;
  createdAt: string;
};

export type CommentRow = {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  body: string;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  title: string;
  otherUserId: string;
  otherUsername: string;
  otherDisplayName: string;
  lastBody: string | null;
  lastAt: string | null;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type RequestRow = {
  id: string;
  kind: "collab" | "offer";
  itemId: string;
  itemTitle: string;
  counterpartId: string;
  counterpartUsername: string;
  message: string;
  status: string;
  incoming: boolean;
  createdAt: string;
};

export type OrderRow = {
  id: string;
  beatId: string;
  beatTitle: string;
  counterpartUsername: string;
  licenseType: string;
  priceCents: number;
  status: string;
  incoming: boolean;
  createdAt: string;
};

export type Playable = {
  id: string;
  kind: CatalogKind;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  audioKind: "synth" | "upload";
  audioSeed: string | null;
  audioData: string | null;
};

export const GENRES = [
  "hip-hop",
  "trap",
  "rnb",
  "lo-fi",
  "drill",
  "house",
  "pop",
  "afrobeat",
  "phonk",
  "ambient",
] as const;

export const KEYS = [
  "C",
  "D",
  "E",
  "F",
  "G",
  "A",
  "Am",
  "Dm",
  "Em",
  "Fm",
  "Gm",
  "Cm",
  "Bb",
  "F#m",
] as const;
