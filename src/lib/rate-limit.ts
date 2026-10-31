type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry) return false;
  if (now >= entry.resetAt) {
    store.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearFailures(key: string): void {
  store.delete(key);
}
