alter publication supabase_realtime add table public.messages;

create policy "chat rooms members insert" on public.chat_rooms for insert to authenticated with check (true);
create policy "chat members self insert" on public.chat_members for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles self update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
grant update on public.profiles to authenticated;
create index if not exists profiles_username_idx on public.profiles(username);

create or replace function public.create_direct_chat(other_user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); chat uuid;
begin
  if me is null or other_user is null or me = other_user then raise exception 'invalid_user'; end if;
  select cm.chat_id into chat from chat_members cm join chat_members cm2 on cm.chat_id = cm2.chat_id join chat_rooms cr on cr.id = cm.chat_id where cm.user_id = me and cm2.user_id = other_user and cr.is_direct = true limit 1;
  if chat is not null then return chat; end if;
  insert into chat_rooms(is_direct) values(true) returning id into chat;
  insert into chat_members(chat_id,user_id) values(chat,me),(chat,other_user);
  return chat;
end; $$;
grant execute on function public.create_direct_chat(uuid) to authenticated;

create or replace function public.accept_friend(friendship_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin update friendships set status='accepted' where id=friendship_id and addressee_id=auth.uid(); end; $$;
grant execute on function public.accept_friend(uuid) to authenticated;
