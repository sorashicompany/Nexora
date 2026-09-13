import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/nexora/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (user) return <Navigate to="/" />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Пароль — минимум 6 символов");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Nexora",
        });
        if (res.error) throw new Error(res.error.message || "Не удалось создать аккаунт");
      }
      const res = await authClient.signIn.email({ email, password, callbackURL: "/" });
      if (res.error) throw new Error(res.error.message || "Не удалось войти");
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-bg lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 30% 40%, color-mix(in oklab, #6b5cf5 28%, transparent), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, color-mix(in oklab, #4a6cf7 18%, transparent), transparent 65%)",
          }}
        />
        <Logo size="md" to={false} className="relative z-10" />
        <div className="relative z-10">
          <h1 className="max-w-lg font-display text-5xl leading-[1.05] tracking-tight text-balance">
            Музыка первая.
            <br />
            Люди рядом.
            <br />
            <span className="brand-gradient-text">Коллаб всегда.</span>
          </h1>
          <p className="mt-6 max-w-md text-muted">
            Сеть для исполнителей и битмейкеров: публикуйте демки, находите биты, предлагайте
            коллаборации и лицензируйте работу — без лишнего шума.
          </p>
        </div>
        <p className="relative z-10 text-sm text-subtle">Discover → people → collab → license.</p>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo size="sm" to={false} />
          </div>
          <h2 className="mt-4 font-display text-3xl tracking-tight lg:mt-0">
            {mode === "in" ? "Вход в студию" : "Создать аккаунт"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {authEnabled
              ? "Google, X или почта — один профиль на все устройства."
              : "Вход отключён."}
          </p>
          {authEnabled ? (
            <div className="mt-8 space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                >
                  Продолжить через {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">Вход отключён.</p>
          )}
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-subtle">
            <span className="h-px flex-1 bg-border" />
            или почта
            <span className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-3" onSubmit={submit}>
            {mode === "up" ? (
              <Input
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            ) : null}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              type="password"
              placeholder="Пароль, 6+ символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              required
              minLength={6}
            />
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy || !authEnabled}>
              {busy ? "Секунду…" : mode === "in" ? "Войти" : "Создать аккаунт"}
            </Button>
          </form>
          <button
            type="button"
            className="mt-5 text-sm text-muted hover:text-fg"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "Нет аккаунта — зарегистрироваться" : "Уже есть аккаунт — войти"}
          </button>
        </div>
      </section>
    </main>
  );
}
