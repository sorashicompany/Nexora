create table if not exists public.telegram_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  challenge text not null unique,
  action text not null check (action in ('login','register')),
  status text not null default 'pending' check (status in ('pending','approved','consumed','rejected')),
  telegram_id bigint,
  telegram_username text,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  expires_at timestamptz not null default (now() + interval '5 minutes'),
  created_at timestamptz not null default now()
);

create table if not exists public.telegram_accounts (
  telegram_id bigint primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  is_direct boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_members (
  chat_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists chat_members_user_idx on public.chat_members(user_id);
create index if not exists messages_chat_created_idx on public.messages(chat_id, created_at desc);
create index if not exists friendships_requester_idx on public.friendships(requester_id, status);
create index if not exists friendships_addressee_idx on public.friendships(addressee_id, status);

alter table public.telegram_auth_challenges enable row level security;
alter table public.telegram_accounts enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;
alter table public.friendships enable row level security;

create policy "telegram accounts self select" on public.telegram_accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy "chat rooms members select" on public.chat_rooms for select to authenticated using (exists (select 1 from public.chat_members cm where cm.chat_id = id and cm.user_id = (select auth.uid())));
create policy "chat members self select" on public.chat_members for select to authenticated using (user_id = (select auth.uid()));
create policy "messages members select" on public.messages for select to authenticated using (exists (select 1 from public.chat_members cm where cm.chat_id = messages.chat_id and cm.user_id = (select auth.uid())));
create policy "messages members insert" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.chat_members cm where cm.chat_id = messages.chat_id and cm.user_id = (select auth.uid())));
create policy "messages own update" on public.messages for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));
create policy "friendships participants select" on public.friendships for select to authenticated using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));
create policy "friendships requester insert" on public.friendships for insert to authenticated with check (requester_id = (select auth.uid()));
create policy "friendships participants update" on public.friendships for update to authenticated using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid())) with check (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

grant select on public.telegram_accounts to authenticated;
grant select on public.chat_rooms to authenticated;
grant select on public.chat_members to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update on public.friendships to authenticated;
