import { formatListText as formatNotifyListText } from "@/lib/notify/format";

export type FormatListItem = {
  name: string;
  quantity: number | null;
  note: string | null;
  addedBy: string;
};

/** Server-side German outbound text (translates item names/notes NL→DE). */
export async function formatListText(
  items: FormatListItem[],
  sentAt: Date = new Date(),
): Promise<string> {
  return formatNotifyListText({ sentAt, items });
}
