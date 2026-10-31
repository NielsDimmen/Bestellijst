"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  // Valid sessions land on /lijst; stale cookies get cleared by /api/me.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!cancelled && res.ok) {
          router.replace("/lijst");
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(false);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      router.replace("/lijst");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <main className="flex w-full max-w-[360px] flex-col gap-8">
        <div className="bus-pass" aria-hidden="true">
          <div className="bus-pass-slot">
            <span />
          </div>
          <div className="bus-pass-band" />
          <div className="bus-pass-word">BUS 2</div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user" className="bus-label">
              Gebruikersnaam
            </label>
            <input
              id="user"
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bus-field"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pass" className="bus-label">
              Wachtwoord
            </label>
            <input
              id="pass"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bus-field"
              required
            />
          </div>
          {error ? <p className="bus-error">Klopt niet</p> : null}
          <button
            type="submit"
            disabled={busy || !username.trim() || !password}
            className="bus-btn mt-2 w-full"
          >
            Inloggen
          </button>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center justify-center text-[15px] text-text-muted"
          >
            Account aanmaken
          </Link>
        </form>
      </main>
    </div>
  );
}
