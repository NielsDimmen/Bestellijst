"use client";

import { useEffect, useState } from "react";

type DeadlineView =
  | { kind: "countdown"; label: string; remaining: string }
  | { kind: "nextMorning"; label: string };

const OPEN_HOUR = 9;
const MIDDAY_END_HOUR = 17;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatRemaining(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}u ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

function atLocal(now: Date, hour: number, dayOffset = 0): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + dayOffset,
    hour,
    0,
    0,
    0,
  );
}

export function getDeadlineView(now: Date): DeadlineView {
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const ms = now.getMilliseconds();
  const sinceMidnight =
    ((hour * 60 + minute) * 60 + second) * 1000 + ms;

  const openMs = OPEN_HOUR * 60 * 60 * 1000;
  const middayEndMs = MIDDAY_END_HOUR * 60 * 60 * 1000;

  if (sinceMidnight < openMs) {
    return {
      kind: "countdown",
      label: "Tijd tot bestellen",
      remaining: formatRemaining(atLocal(now, OPEN_HOUR).getTime() - now.getTime()),
    };
  }

  if (sinceMidnight < middayEndMs) {
    return {
      kind: "nextMorning",
      label: "Bestellingen gelden voor morgenochtend",
    };
  }

  return {
    kind: "countdown",
    label: "Tijd tot bestellen",
    remaining: formatRemaining(
      atLocal(now, OPEN_HOUR, 1).getTime() - now.getTime(),
    ),
  };
}

export function OrderDeadlineCountdown() {
  const [view, setView] = useState<DeadlineView | null>(null);

  useEffect(() => {
    const tick = () => setView(getDeadlineView(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!view) return null;

  if (view.kind === "nextMorning") {
    return (
      <p className="m-0 border-b border-line px-4 py-3 text-[15px] text-text-dim">
        {view.label}
      </p>
    );
  }

  return (
    <p className="m-0 flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 text-[15px]">
      <span className="text-text-dim">{view.label}</span>
      <span className="font-medium text-text">{view.remaining}</span>
    </p>
  );
}
