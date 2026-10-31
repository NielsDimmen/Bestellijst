"use client";

import { useState } from "react";

type Props = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className ?? "bus-btn min-h-11 min-w-11 px-4"}
    >
      {copied ? "Gekopieerd" : "Kopiëren"}
    </button>
  );
}
