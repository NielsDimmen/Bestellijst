"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OutboundTextPanel } from "@/components/OutboundTextPanel";
import { normalizeWhatsAppPhone } from "@/lib/notify/whatsapp";

type DetailItem = {
  id: string;
  name: string;
  quantity: number | null;
  note: string | null;
  createdBy: { id: string; name: string };
};

type ListDetail = {
  id: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  items: DetailItem[];
};

export default function AdminLijstDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [list, setList] = useState<ListDetail | null>(null);
  const [panelText, setPanelText] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState(false);
  const [cateringPhone, setCateringPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, settingsRes] = await Promise.all([
          fetch(`/api/admin/lists/${id}`),
          fetch("/api/admin/settings"),
        ]);
        if (listRes.ok) {
          const data = (await listRes.json()) as ListDetail;
          if (!cancelled) setList(data);
        }
        if (settingsRes.ok) {
          const data = (await settingsRes.json()) as { cateringPhone: string };
          const raw = data.cateringPhone ?? "";
          if (!cancelled) {
            setCateringPhone(raw.trim() ? normalizeWhatsAppPhone(raw) : "");
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function openOutboundText() {
    setTextLoading(true);
    try {
      const res = await fetch(`/api/admin/lists/${id}/text`, {
        method: "POST",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { text: string };
      setPanelText(data.text);
    } catch {
      // ignore
    } finally {
      setTextLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/lijsten"
          className="inline-flex min-h-11 items-center px-1 text-[15px] text-text-muted"
        >
          Terug
        </Link>
        <h1 className="m-0 text-[18px] font-semibold text-text">Lijst</h1>
      </div>

      {list ? (
        <>
          <ul className="m-0 list-none p-0">
            {list.items.map((item) => (
              <li key={item.id} className="bus-row" style={{ cursor: "default" }}>
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
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => void openOutboundText()}
            disabled={textLoading}
            className="bus-btn-ghost h-[52px] w-full"
          >
            {textLoading ? "Bezig…" : "Tekst"}
          </button>

          {panelText != null ? (
            <OutboundTextPanel
              text={panelText}
              onTextChange={setPanelText}
              phone={cateringPhone}
              onClose={() => setPanelText(null)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
