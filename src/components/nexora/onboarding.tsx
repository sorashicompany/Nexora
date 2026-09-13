import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateMyProfile } from "@/lib/nexora/api";
import type { Profile, ProfileType } from "@/lib/nexora/types";

export function Onboarding({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: (p: Profile) => void;
}) {
  const [type, setType] = useState<ProfileType>(
    profile.profileType === "user" ? "artist" : profile.profileType,
  );
  const [username, setUsername] = useState(profile.username);
  const [name, setName] = useState(profile.displayName === "Nexora user" ? "" : profile.displayName);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4">
      <form
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-panel"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          void updateMyProfile({
            data: {
              username,
              displayName: name || username,
              profileType: type,
            },
          })
            .then(onDone)
            .catch((err: unknown) => {
              setError(err instanceof Error ? err.message : "Не удалось сохранить");
            })
            .finally(() => setBusy(false));
        }}
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Регистрация</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight">Кто вы в Nexora</h2>
        <p className="mt-2 text-sm text-muted">
          Тип профиля задаёт, что вы публикуете: демки или биты.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {(
            [
              ["artist", "Исполнитель", "Демки, коллабы, вокал"],
              ["beatmaker", "Битмейкер", "Каталог битов и лицензии"],
            ] as const
          ).map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-lg border p-4 text-left transition-colors duration-150 ${
                type === value
                  ? "border-accent bg-elevated text-fg"
                  : "border-border bg-bg text-muted hover:text-fg"
              }`}
            >
              <div className="font-medium text-fg">{label}</div>
              <div className="mt-1 text-xs">{hint}</div>
            </button>
          ))}
        </div>
        <label className="mt-5 block text-xs uppercase tracking-wider text-muted">Ник</label>
        <Input
          className="mt-1.5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="luna.vox"
          required
          minLength={3}
        />
        <label className="mt-4 block text-xs uppercase tracking-wider text-muted">Имя</label>
        <Input
          className="mt-1.5"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Как вас представлять"
        />
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Сохраняем…" : "Продолжить"}
        </Button>
      </form>
    </div>
  );
}
