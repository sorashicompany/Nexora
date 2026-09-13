import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ensureMyProfile, publishItem } from "@/lib/nexora/api";
import { GENRES, KEYS, type CatalogKind, type Profile } from "@/lib/nexora/types";

export const Route = createFileRoute("/_studio/create")({ component: Create });

const MAX = 1_400_000;

function Create() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kind, setKind] = useState<CatalogKind>("track");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("hip-hop");
  const [bpm, setBpm] = useState("96");
  const [key, setKey] = useState("Am");
  const [price, setPrice] = useState("29");
  const [description, setDescription] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void ensureMyProfile().then((p) => {
      setProfile(p);
      setKind(p.profileType === "beatmaker" ? "beat" : "track");
    });
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-8">
      <p className="text-xs uppercase tracking-[0.22em] text-muted">Create</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Загрузить</h1>
      <p className="mt-2 text-sm text-muted">
        {profile?.profileType === "beatmaker"
          ? "Опубликуйте бит в маркетплейс. Можно синтезировать превью или приложить свой файл."
          : "Опубликуйте демку. Синтез по BPM и тональности или свой аудиофайл."}
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          void publishItem({
            data: {
              kind,
              title,
              genre,
              bpm: Number(bpm) || 0,
              musicalKey: key,
              description,
              priceEuro: kind === "beat" ? Number(price) || 0 : 0,
              audioKind: fileData ? "upload" : "synth",
              audioSeed: `${title}-${bpm}-${key}`,
              audioData: fileData ?? undefined,
            },
          })
            .then(() => nav({ to: kind === "beat" ? "/library" : "/" }))
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Ошибка публикации"))
            .finally(() => setBusy(false));
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={kind === "track" ? "default" : "secondary"}
            onClick={() => setKind("track")}
          >
            Демка
          </Button>
          <Button
            type="button"
            variant={kind === "beat" ? "default" : "secondary"}
            onClick={() => setKind("beat")}
          >
            Бит
          </Button>
        </div>
        <Input
          placeholder="Название"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={160}
        />
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            Жанр
            <select
              className="mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-muted">
            Тональность
            <select
              className="mt-1.5 flex h-11 w-full rounded-sm border border-border bg-elevated px-3 text-sm text-fg"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-muted">
            BPM
            <Input
              className="mt-1.5"
              type="number"
              min={40}
              max={220}
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
            />
          </label>
          {kind === "beat" ? (
            <label className="block text-xs text-muted">
              Цена, €
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
          ) : (
            <div />
          )}
        </div>
        <Textarea
          placeholder="Короткое описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={400}
        />
        <label className="block rounded-lg border border-dashed border-border bg-elevated px-4 py-6 text-sm text-muted">
          Аудиофайл (необязательно, до ~1 МБ)
          <input
            type="file"
            accept="audio/*"
            className="mt-3 block w-full text-xs text-fg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                setFileData(null);
                setFileName("");
                return;
              }
              if (file.size > MAX) {
                setError("Файл слишком большой — оставьте синтез или сожмите MP3.");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                setFileData(String(reader.result));
                setFileName(file.name);
              };
              reader.readAsDataURL(file);
            }}
          />
          <span className="mt-2 block text-xs text-subtle">
            {fileName ? fileName : "Без файла Nexora соберёт студийное превью из BPM и тональности."}
          </span>
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy || !title.trim()}>
          {busy ? "Публикуем…" : "Опубликовать"}
        </Button>
      </form>
    </div>
  );
}
