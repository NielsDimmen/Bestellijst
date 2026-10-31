"use client";

import { useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";
import { buildWhatsAppUrl } from "@/lib/notify/whatsapp";

type Props = {
  text: string;
  onTextChange: (text: string) => void;
  phone?: string;
  showMissingPhoneHint?: boolean;
  onClose: () => void;
};

export function OutboundTextPanel({
  text,
  onTextChange,
  phone = "",
  showMissingPhoneHint = false,
  onClose,
}: Props) {
  const whatsappUrl = useMemo(
    () => buildWhatsAppUrl(phone, text),
    [phone, text],
  );

  return (
    <div className="flex flex-col gap-3 border border-line-strong bg-surface p-4">
      <label className="sr-only" htmlFor="outbound-text">
        Bericht
      </label>
      <textarea
        id="outbound-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={12}
        className="bus-field bus-field-area"
      />
      {showMissingPhoneHint && !whatsappUrl ? (
        <p className="m-0 text-[14px] text-text-muted">
          Geen cateringnummer — stel in via admin.
        </p>
      ) : null}
      <div className="flex flex-col gap-2">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bus-btn w-full"
          >
            WhatsApp
          </a>
        ) : null}
        <div className="flex gap-2">
          <CopyButton
            text={text}
            className={
              whatsappUrl
                ? "bus-btn-ghost min-h-11 min-w-11 flex-1"
                : undefined
            }
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center px-4 text-[15px] text-text-muted"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
