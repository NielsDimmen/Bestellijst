"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  isAdmin: boolean;
};

export function AppHeader({ name, isAdmin }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function logout() {
    if (busy) return;
    setBusy(true);
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-line bg-bg px-4">
      <Link href="/lijst" className="bus-tag" aria-label="Bus 2">
        BUS 2
      </Link>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex min-h-11 items-center bg-transparent px-1 text-[15px] text-text-muted"
        >
          {name}
        </button>
        {open ? (
          <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] border border-line-strong bg-surface">
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center px-3 text-[15px] text-text"
              >
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void logout()}
              disabled={busy}
              className="flex min-h-11 w-full items-center px-3 text-left text-[15px] text-text disabled:opacity-40"
            >
              Uitloggen
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
