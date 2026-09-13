import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ensureMyProfile, updateMyProfile } from "@/lib/nexora/api";
import type { Profile, ProfileType } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/profile")({ component: ProfilePage });

function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [type, setType] = useState<ProfileType>("user");
  const [channel, setChannel] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureMyProfile().then((p) => {
      setProfile(p);
      setUsername(p.username);
      setDisplayName(p.displayName);
      setBio(p.bio);
      setType(p.profileType);
      setChannel(p.channel ?? "");
    });
  }, []);

  if (!profile) return <div className="p-8 text-sm text-muted">Загружаем профиль…</div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Profile</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Профиль</h1>
      <p className="mt-2 text-sm text-muted">
        Публичная карточка. ID <span className="font-mono text-fg">{profile.profileCode}</span>
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setMsg("");
          void updateMyProfile({
            data: {
              username,
              displayName,
              bio,
              profileType: type,
              channel: channel || null,
            },
          })
            .then((p) => {
              setProfile(p);
              setMsg("Сохранено");
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Ошибка"))
            .finally(() => setBusy(false));
        }}
      >
        <label className="block text-xs text-muted">
          Ник
          <Input className="mt-1.5" value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block text-xs text-muted">
          Имя
          <Input className="mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </label>
        <label className="block text-xs text-muted">
          О себе
          <Textarea className="mt-1.5" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} />
        </label>
        <label className="block text-xs text-muted">
          Тип
          <select
            className="mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg"
            value={type}
            onChange={(e) => setType(e.target.value as ProfileType)}
          >
            <option value="artist">Исполнитель</option>
            <option value="beatmaker">Битмейкер</option>
            <option value="user">Не выбран</option>
          </select>
        </label>
        <label className="block text-xs text-muted">
          Канал / ссылка
          <Input
            className="mt-1.5"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="@channel"
          />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {msg ? <p className="text-sm text-ok">{msg}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "Сохраняем…" : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}
