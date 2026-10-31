import { formatListText } from "./format";
import type { NotifyList, NotifyService } from "./types";

export const plaintextNotify: NotifyService = {
  async sendList(list: NotifyList): Promise<{ text: string }> {
    return { text: await formatListText(list) };
  },
};
