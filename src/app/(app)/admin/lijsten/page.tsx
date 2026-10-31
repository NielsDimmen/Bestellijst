"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ListRow = {
  id: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  itemCount: number;
};

function formatWhen(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function AdminLijstenPage() {
  const [lists, setLists] = useState<ListRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/lists");
        if (!res.ok) return;
        const data = (await res.json()) as ListRow[];
        if (!cancelled) {
          setLists(data.filter((l) => l.status === "SENT"));
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center px-1 text-[15px] text-text-muted"
        >
          Terug
        </Link>
        <h1 className="m-0 text-[18px] font-semibold text-text">Oude lijsten</h1>
      </div>

      <ul className="m-0 list-none p-0">
        {lists.map((list) => (
          <li key={list.id}>
            <Link
              href={`/admin/lijsten/${list.id}`}
              className="flex min-h-11 items-baseline justify-between gap-3 border-b border-line py-3.5 text-text"
            >
              <span className="text-[18px] font-medium">
                {formatWhen(list.sentAt ?? list.createdAt)}
              </span>
              <span className="bus-qty">{list.itemCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
