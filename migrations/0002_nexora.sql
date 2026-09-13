create table if not exists profiles (
  user_id text primary key,
  username text not null unique,
  display_name text not null,
  bio text not null default '',
  profile_type text not null default 'user',
  channel text,
  profile_code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists tracks (
  id text primary key,
  owner_id text not null references profiles(user_id) on delete cascade,
  title text not null,
  description text not null default '',
  genre text not null default '',
  bpm integer not null default 0,
  musical_key text not null default '',
  audio_kind text not null default 'synth',
  audio_seed text,
  audio_data text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists beats (
  id text primary key,
  beatmaker_id text not null references profiles(user_id) on delete cascade,
  title text not null,
  description text not null default '',
  genre text not null default '',
  bpm integer not null default 0,
  musical_key text not null default '',
  audio_kind text not null default 'synth',
  audio_seed text,
  audio_data text,
  price_cents integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists track_likes (
  user_id text not null references profiles(user_id) on delete cascade,
  track_id text not null references tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, track_id)
);

create table if not exists beat_likes (
  user_id text not null references profiles(user_id) on delete cascade,
  beat_id text not null references beats(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, beat_id)
);

create table if not exists comments (
  id text primary key,
  user_id text not null references profiles(user_id) on delete cascade,
  target_kind text not null,
  target_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  follower_id text not null references profiles(user_id) on delete cascade,
  followee_id text not null references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

create table if not exists collab_requests (
  id text primary key,
  track_id text not null references tracks(id) on delete cascade,
  sender_id text not null references profiles(user_id) on delete cascade,
  receiver_id text not null references profiles(user_id) on delete cascade,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists beat_offers (
  id text primary key,
  beat_id text not null references beats(id) on delete cascade,
  sender_id text not null references profiles(user_id) on delete cascade,
  receiver_id text not null references profiles(user_id) on delete cascade,
  message text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists beat_orders (
  id text primary key,
  beat_id text not null references beats(id) on delete cascade,
  buyer_id text not null references profiles(user_id) on delete cascade,
  seller_id text not null references profiles(user_id) on delete cascade,
  license_type text not null default 'standard',
  price_cents integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists chat_rooms (
  id text primary key,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists chat_members (
  room_id text not null references chat_rooms(id) on delete cascade,
  user_id text not null references profiles(user_id) on delete cascade,
  primary key (room_id, user_id)
);

create table if not exists messages (
  id text primary key,
  room_id text not null references chat_rooms(id) on delete cascade,
  sender_id text not null references profiles(user_id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists tracks_created_idx on tracks (created_at desc);
create index if not exists beats_created_idx on beats (created_at desc);
create index if not exists comments_target_idx on comments (target_kind, target_id, created_at);
create index if not exists messages_room_idx on messages (room_id, created_at);
create index if not exists collab_receiver_idx on collab_requests (receiver_id, created_at desc);
create index if not exists offers_receiver_idx on beat_offers (receiver_id, created_at desc);

insert into profiles (user_id, username, display_name, bio, profile_type, profile_code, created_at) values
  ('catalog-luna', 'luna.vox', 'Luna Vox', 'R&B vocalist. Night sessions, close-mic, no filler.', 'artist', 'nx100001', now() - interval '40 days'),
  ('catalog-kairo', 'kairo', 'Kairo', 'Trap & R&B producer. Chrome drums, wide 808s.', 'beatmaker', 'nx100002', now() - interval '38 days'),
  ('catalog-north', 'northside', 'Northside', 'Hip-hop writer. Stories from the 9th floor.', 'artist', 'nx100003', now() - interval '36 days'),
  ('catalog-mica', 'mica', 'Mica', 'Lo-fi beats, tape hiss, rainy windows.', 'beatmaker', 'nx100004', now() - interval '34 days'),
  ('catalog-vesper', 'vesper', 'Vesper', 'Pop toplines. Catchy without the sugar crash.', 'artist', 'nx100005', now() - interval '32 days'),
  ('catalog-drum', 'drumline', 'Drumline', 'Drill & trap kits. Fast hats, heavy kicks.', 'beatmaker', 'nx100006', now() - interval '30 days'),
  ('catalog-aya', 'aya.wave', 'Aya Wave', 'Afrobeat vocals, sun on the downbeat.', 'artist', 'nx100007', now() - interval '28 days'),
  ('catalog-salt', 'saltbox', 'Saltbox', 'House grooves for late rooms.', 'beatmaker', 'nx100008', now() - interval '26 days'),
  ('catalog-echo', 'echo.park', 'Echo Park', 'Ambient sketches and film beds.', 'artist', 'nx100009', now() - interval '24 days'),
  ('catalog-grid', 'gridlock', 'Gridlock', 'Phonk bass, night-drive distortion.', 'beatmaker', 'nx100010', now() - interval '22 days')
on conflict (user_id) do nothing;

insert into tracks (id, owner_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, published, created_at) values
  ('track-01', 'catalog-luna', 'Midnight Caller', 'Late-night demo, dry vocal, no autotune.', 'rnb', 92, 'Dm', 'synth', 'luna-midnight', true, now() - interval '18 days'),
  ('track-02', 'catalog-north', 'Glass Roof', 'Verse + hook sketch about looking up.', 'hip-hop', 86, 'Am', 'synth', 'north-glass', true, now() - interval '16 days'),
  ('track-03', 'catalog-vesper', 'Soft Static', 'Radio-pop topline over a thin pad.', 'pop', 104, 'C', 'synth', 'vesper-static', true, now() - interval '14 days'),
  ('track-04', 'catalog-aya', 'Heatwave', 'Call-and-response over a warm groove.', 'afrobeat', 112, 'F', 'synth', 'aya-heat', true, now() - interval '12 days'),
  ('track-05', 'catalog-echo', 'Low Orbit', 'Wordless vocal bed for picture.', 'ambient', 70, 'Em', 'synth', 'echo-orbit', true, now() - interval '10 days'),
  ('track-06', 'catalog-north', 'Room 204', 'Second verse only. Needs a beat.', 'hip-hop', 90, 'Fm', 'synth', 'north-204', true, now() - interval '8 days'),
  ('track-07', 'catalog-luna', 'Slow Burn', 'Bridge idea. Looking for a producer.', 'rnb', 78, 'Gm', 'synth', 'luna-burn', true, now() - interval '6 days'),
  ('track-08', 'catalog-vesper', 'Echo Chamber', 'Chorus first. Verse still open.', 'pop', 118, 'G', 'synth', 'vesper-echo', true, now() - interval '4 days'),
  ('track-09', 'catalog-echo', 'River Light', 'Piano and air. Need percussion.', 'ambient', 64, 'D', 'synth', 'echo-river', true, now() - interval '2 days'),
  ('track-10', 'catalog-aya', 'Palmwine', 'Sunday session, open verse.', 'afrobeat', 108, 'C', 'synth', 'aya-palm', true, now() - interval '1 day')
on conflict (id) do nothing;

insert into beats (id, beatmaker_id, title, description, genre, bpm, musical_key, audio_kind, audio_seed, price_cents, published, created_at) values
  ('beat-01', 'catalog-kairo', 'Chrome 140', 'Hard trap. Open verse, tagged preview.', 'trap', 140, 'F#m', 'synth', 'kairo-chrome', 4900, true, now() - interval '17 days'),
  ('beat-02', 'catalog-mica', 'Tape Dust', 'Lo-fi loop, vinyl crackle, Rhodes.', 'lo-fi', 84, 'C', 'synth', 'mica-tape', 2900, true, now() - interval '15 days'),
  ('beat-03', 'catalog-drum', 'Block 9', 'UK drill slide bass.', 'drill', 142, 'Gm', 'synth', 'drum-block', 5900, true, now() - interval '13 days'),
  ('beat-04', 'catalog-salt', 'After Hours', 'Four-on-the-floor, analog bass.', 'house', 124, 'A', 'synth', 'salt-hours', 3900, true, now() - interval '11 days'),
  ('beat-05', 'catalog-grid', 'Night Shift', 'Phonk cowbell + distorted 808.', 'phonk', 130, 'Em', 'synth', 'grid-shift', 4500, true, now() - interval '9 days'),
  ('beat-06', 'catalog-kairo', 'Silk Route', 'R&B bounce, clean hats.', 'rnb', 96, 'D', 'synth', 'kairo-silk', 4200, true, now() - interval '7 days'),
  ('beat-07', 'catalog-mica', 'Paper Moon', 'Dusty drums, long reverb tails.', 'lo-fi', 78, 'Bb', 'synth', 'mica-moon', 2500, true, now() - interval '5 days'),
  ('beat-08', 'catalog-drum', 'Voltage', 'Trap kit, sparse melody.', 'trap', 148, 'Cm', 'synth', 'drum-volt', 5500, true, now() - interval '3 days'),
  ('beat-09', 'catalog-salt', 'Docklands', 'Deep house, rolling bass.', 'house', 122, 'Fm', 'synth', 'salt-dock', 3700, true, now() - interval '2 days'),
  ('beat-10', 'catalog-grid', 'Low Rider', 'Slow phonk, wide stereo.', 'phonk', 118, 'Am', 'synth', 'grid-rider', 4100, true, now() - interval '20 hours')
on conflict (id) do nothing;

insert into comments (id, user_id, target_kind, target_id, body, created_at) values
  ('cmt-01', 'catalog-kairo', 'track', 'track-01', 'That last ad-lib sits perfectly. I have a 92 BPM pocket for this.', now() - interval '17 days'),
  ('cmt-02', 'catalog-mica', 'track', 'track-05', 'Would love to bed this under a lo-fi kit. Sending an offer.', now() - interval '9 days'),
  ('cmt-03', 'catalog-luna', 'beat', 'beat-06', 'Silk Route is exactly the bounce I was looking for.', now() - interval '6 days'),
  ('cmt-04', 'catalog-north', 'beat', 'beat-01', 'Chrome 140 slaps. Need an exclusive if it is still open.', now() - interval '12 days')
on conflict (id) do nothing;

insert into track_likes (user_id, track_id) values
  ('catalog-kairo', 'track-01'),
  ('catalog-mica', 'track-01'),
  ('catalog-salt', 'track-03'),
  ('catalog-grid', 'track-04'),
  ('catalog-drum', 'track-02')
on conflict do nothing;

insert into beat_likes (user_id, beat_id) values
  ('catalog-luna', 'beat-06'),
  ('catalog-north', 'beat-01'),
  ('catalog-vesper', 'beat-04'),
  ('catalog-aya', 'beat-02'),
  ('catalog-echo', 'beat-07')
on conflict do nothing;
