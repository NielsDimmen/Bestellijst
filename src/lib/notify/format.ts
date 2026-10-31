import type { NotifyList } from "./types";
import { translateItems } from "./translate";

function formatGermanDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatLine(item: NotifyList["items"][number]): string {
  const qty =
    item.quantity != null && item.quantity > 0 ? `${item.quantity}× ` : "";
  const note = item.note?.trim() ? ` (${item.note.trim()})` : "";
  return `- ${qty}${item.name}${note} — ${item.addedBy}`;
}

export async function formatListText(list: NotifyList): Promise<string> {
  const items = await translateItems(list.items);
  const header = `Bus 2 — Einkaufsliste`;
  const when = `Bestellung für ${formatGermanDate(list.sentAt)}`;
  const body =
    items.length === 0
      ? "(keine Artikel)"
      : items.map(formatLine).join("\n");

  return `${header}\n${when}\n\n${body}`;
}
