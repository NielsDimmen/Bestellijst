import { plaintextNotify } from "./plaintext";
import type { NotifyService } from "./types";

export type { NotifyList, NotifyService } from "./types";
export { buildWhatsAppUrl, normalizeWhatsAppPhone } from "./whatsapp";
export { resolveCateringPhone } from "./catering-phone";

export class NotifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotifyError";
  }
}

/** Plaintext list formatter — WhatsApp is a separate wa.me deeplink helper. */
export function getNotifyService(): NotifyService {
  return plaintextNotify;
}
