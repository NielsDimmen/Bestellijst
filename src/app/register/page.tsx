"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");

    if (password !== confirm) {
      setError("Klopt niet");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      if (!res.ok) {
        setError("Klopt niet");
        return;
      }
      setDone(true);
    } catch {
      setError("Klopt niet");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
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
          <p className="text-center text-[18px] text-text">
            Wacht op goedkeuring.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="bus-btn w-full"
          >
            Naar inloggen
          </button>
        </main>
      </div>
    );
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
            <label htmlFor="name" className="bus-label">
              Naam
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bus-field"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user" className="bus-label">
              Gebruikersnaam
            </label>
            <input
              id="user"
              type="text"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bus-field"
              required
              minLength={6}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirm" className="bus-label">
              Bevestig wachtwoord
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bus-field"
              required
              minLength={6}
            />
          </div>
          {error ? <p className="bus-error">{error}</p> : null}
          <button
            type="submit"
            disabled={
              busy ||
              !name.trim() ||
              !username.trim() ||
              !password ||
              !confirm
            }
            className="bus-btn mt-2 w-full"
          >
            Registreren
          </button>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center text-[15px] text-text-muted"
          >
            Inloggen
          </Link>
        </form>
      </main>
    </div>
  );
}
