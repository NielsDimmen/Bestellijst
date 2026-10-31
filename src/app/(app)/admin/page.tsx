"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  approved: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsAdmin, setNewIsAdmin] = useState(false);
  const [cateringPhone, setCateringPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [meId, setMeId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [usersRes, settingsRes, meRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/settings"),
        fetch("/api/me"),
      ]);
      if (usersRes.ok) {
        setUsers((await usersRes.json()) as UserRow[]);
      }
      if (settingsRes.ok) {
        const data = (await settingsRes.json()) as { cateringPhone: string };
        setCateringPhone(data.cateringPhone ?? "");
      }
      if (meRes.ok) {
        const me = (await meRes.json()) as { id: string };
        setMeId(me.id);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);

  async function addUser(e: FormEvent) {
    e.preventDefault();
    if (busy || !newName.trim() || !newUsername.trim() || !newPassword) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          username: newUsername.trim(),
          password: newPassword,
          isAdmin: newIsAdmin,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      setNewName("");
      setNewUsername("");
      setNewPassword("");
      setNewIsAdmin(false);
      await load();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function approveUser(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      await load();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function rejectUser(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      await load();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function toggleAdmin(user: UserRow) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      await load();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      await load();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cateringPhone }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-8 pt-4">
      <section className="flex flex-col gap-3">
        <h1 className="m-0 text-[18px] font-semibold text-text">Gebruikers</h1>

        {pending.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h2 className="bus-label m-0">In afwachting</h2>
            <ul className="m-0 list-none p-0">
              {pending.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-2 border-b border-line py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="m-0 truncate text-[18px] font-medium text-text">
                      {user.name}
                    </p>
                    <p className="m-0 truncate text-[14px] text-text-muted">
                      @{user.username}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void approveUser(user.id)}
                    disabled={busy}
                    className="inline-flex min-h-11 items-center px-3 text-[15px] text-text disabled:opacity-40"
                  >
                    Goedkeuren
                  </button>
                  <button
                    type="button"
                    onClick={() => void rejectUser(user.id)}
                    disabled={busy}
                    className="inline-flex min-h-11 items-center px-3 text-[15px] text-danger disabled:opacity-40"
                  >
                    Weigeren
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <form onSubmit={addUser} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Naam"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bus-field"
            required
          />
          <input
            type="text"
            placeholder="Gebruikersnaam"
            autoCapitalize="none"
            autoCorrect="off"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="bus-field"
            required
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bus-field"
            required
            minLength={6}
          />
          <label className="flex min-h-11 items-center gap-3 text-[15px] text-text-dim">
            <input
              type="checkbox"
              checked={newIsAdmin}
              onChange={(e) => setNewIsAdmin(e.target.checked)}
              className="size-5 accent-accent"
            />
            Admin
          </label>
          <button
            type="submit"
            disabled={
              busy ||
              !newName.trim() ||
              !newUsername.trim() ||
              !newPassword
            }
            className="bus-btn w-full"
          >
            Toevoegen
          </button>
        </form>

        <div className="flex flex-col gap-2">
          <h2 className="bus-label m-0">Goedgekeurd</h2>
          <ul className="m-0 list-none p-0">
            {approved.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-2 border-b border-line py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-[18px] font-medium text-text">
                    {user.name}
                  </p>
                  <p className="m-0 truncate text-[14px] text-text-muted">
                    @{user.username}
                    {user.isAdmin ? " · Admin" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleAdmin(user)}
                  disabled={busy || user.id === meId}
                  className="inline-flex min-h-11 items-center px-3 text-[15px] text-text-dim disabled:opacity-40"
                >
                  {user.isAdmin ? "Geen admin" : "Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => void deleteUser(user.id)}
                  disabled={busy || user.id === meId}
                  className="inline-flex min-h-11 items-center px-3 text-[15px] text-danger disabled:opacity-40"
                >
                  Wis
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 text-[18px] font-semibold text-text">Catering</h2>
        <form onSubmit={saveSettings} className="flex flex-col gap-3">
          <input
            type="tel"
            placeholder="Telefoon"
            value={cateringPhone}
            onChange={(e) => setCateringPhone(e.target.value)}
            className="bus-field"
          />
          <button type="submit" disabled={busy} className="bus-btn-ghost h-[52px] w-full">
            Opslaan
          </button>
        </form>
      </section>

      <Link href="/admin/lijsten" className="bus-btn-ghost h-[52px] w-full">
        Oude lijsten
      </Link>

      {error ? <p className="bus-error">{error}</p> : null}
    </div>
  );
}
