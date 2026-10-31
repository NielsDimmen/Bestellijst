"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { OrderDeadlineCountdown } from "@/components/OrderDeadlineCountdown";
import { OutboundTextPanel } from "@/components/OutboundTextPanel";

type Me = { id: string; name: string; isAdmin: boolean };

type ListItem = {
  id: string;
  name: string;
  quantity: number | null;
  note: string | null;
  createdBy: { id: string; name: string };
};

type ActiveList = {
  id: string;
  status: string;
  items: ListItem[];
};

export default function LijstPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [list, setList] = useState<ActiveList | null>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sentText, setSentText] = useState<string | null>(null);
  const [cateringPhone, setCateringPhone] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editNote, setEditNote] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/list");
      if (!res.ok) return;
      const data = (await res.json()) as ActiveList;
      setList(data);
    } catch {
      // ignore poll errors
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = (await res.json()) as Me;
        if (!cancelled) setMe(data);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 3000);
    return () => window.clearInterval(id);
  }, [refresh]);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;

    const qtyRaw = quantity.trim();
    let qty = 1;
    if (qtyRaw) {
      const parsed = Number(qtyRaw);
      if (!Number.isInteger(parsed) || parsed < 1) {
        setError("Aantal moet een positief geheel getal zijn");
        return;
      }
      qty = parsed;
    }

    setBusy(true);
    setError("");
    setMenuId(null);
    try {
      const res = await fetch("/api/list/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), quantity: qty }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      setName("");
      setQuantity("");
      await refresh();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: ListItem) {
    setMenuId(null);
    setEditingId(item.id);
    setEditName(item.name);
    setEditQuantity(item.quantity != null ? String(item.quantity) : "");
    setEditNote(item.note ?? "");
  }

  async function saveEdit(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/list/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          quantity: editQuantity.trim() ? Number(editQuantity) : null,
          note: editNote.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      setEditingId(null);
      await refresh();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMenuId(null);
    try {
      const res = await fetch(`/api/list/items/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error || "Mislukt");
        return;
      }
      if (editingId === id) setEditingId(null);
      await refresh();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  async function verstuur() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/list/close", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        text?: string;
        phone?: string;
        whatsappUrl?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Mislukt");
        return;
      }
      setSentText(data.text ?? "");
      setCateringPhone(data.phone ?? "");
      await refresh();
    } catch {
      setError("Mislukt");
    } finally {
      setBusy(false);
    }
  }

  const items = list?.items ?? [];

  return (
    <div className="flex flex-col">
      <OrderDeadlineCountdown />
      <form onSubmit={onAdd} className="flex gap-2 p-4">
        <label className="sr-only" htmlFor="qty">
          Aantal
        </label>
        <input
          id="qty"
          type="number"
          name="quantity"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="1"
          autoComplete="off"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="bus-field bus-qty-field"
        />
        <label className="sr-only" htmlFor="item">
          Item
        </label>
        <input
          id="item"
          type="text"
          name="name"
          placeholder="Wat moet er mee?"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bus-field min-w-0 flex-1"
          required
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="bus-btn-add"
          aria-label="Toevoegen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4v16M4 12h16"
              stroke="#111"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      </form>

      {error ? <p className="bus-error px-4">{error}</p> : null}

      {me?.isAdmin ? (
        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={verstuur}
            disabled={busy}
            className="bus-btn-ghost h-[52px] w-full"
          >
            Verstuur
          </button>
        </div>
      ) : null}

      {sentText != null ? (
        <div className="mx-4 mb-4">
          <OutboundTextPanel
            text={sentText}
            onTextChange={setSentText}
            phone={cateringPhone}
            showMissingPhoneHint
            onClose={() => {
              setSentText(null);
              setCateringPhone("");
            }}
          />
        </div>
      ) : null}

      <ul className="m-0 list-none px-4 pb-8">
        {items.map((item) => {
          const canEdit =
            me != null && (me.isAdmin || me.id === item.createdBy.id);
          const isEditing = editingId === item.id;
          const menuOpen = menuId === item.id;

          return (
            <li key={item.id}>
              {isEditing ? (
                <div className="flex flex-col gap-2 border-b border-line py-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bus-field"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      placeholder="1"
                      aria-label="Aantal"
                      className="bus-field bus-qty-field"
                    />
                    <input
                      type="text"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Opmerking"
                      className="bus-field min-w-0 flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void saveEdit(item.id)}
                      disabled={busy || !editName.trim()}
                      className="bus-btn min-h-11 flex-1 px-4"
                    >
                      Opslaan
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex min-h-11 items-center px-4 text-[15px] text-text-muted"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    className="bus-row"
                    onClick={() => {
                      if (!canEdit) return;
                      setMenuId(menuOpen ? null : item.id);
                    }}
                    disabled={!canEdit}
                    style={{ cursor: canEdit ? "pointer" : "default" }}
                  >
                    <span className="bus-qty">
                      {item.quantity != null ? item.quantity : ""}
                    </span>
                    <span className="bus-name">
                      {item.name}
                      {item.note ? (
                        <span className="mt-0.5 block text-[14px] font-normal text-text-muted">
                          {item.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="bus-who">{item.createdBy.name}</span>
                  </button>
                  {menuOpen ? (
                    <div className="mb-2 flex gap-2 border-b border-line pb-3">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="bus-btn-ghost min-h-11 flex-1"
                      >
                        Bewerken
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        disabled={busy}
                        className="inline-flex min-h-11 flex-1 items-center justify-center rounded-bus border border-line-strong text-[15px] text-danger disabled:opacity-40"
                      >
                        Verwijderen
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
