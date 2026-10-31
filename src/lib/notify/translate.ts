/**
 * NL→DE for WhatsApp outbound list text (item names + notes).
 *
 * Resolution order per phrase:
 * 1. In-memory cache
 * 2. Built-in grocery dictionary (~100 terms) — preferred for common items
 *    (MyMemory sometimes returns weak hits, e.g. brood → "brotje")
 * 3. MyMemory free API (no key)
 * 4. LibreTranslate public instances (no key when available)
 * 5. Pass-through original text
 *
 * If outbound DNS fails in a sandbox (curl exit 6), dictionary + pass-through
 * still work; MyMemory/LibreTranslate run when network is available in production.
 */

export type TranslatableItem = {
  name: string;
  quantity: number | null;
  note: string | null;
  addedBy: string;
};

/** Common Dutch grocery / bus-stock words → German. */
const GROCERY_NL_DE: Record<string, string> = {
  melk: "Milch",
  "halfvolle melk": "fettarme Milch",
  halfvolle: "fettarme",
  "volle melk": "Vollmilch",
  yoghurt: "Joghurt",
  kwark: "Quark",
  room: "Sahne",
  slagroom: "Schlagsahne",
  boter: "Butter",
  margarine: "Margarine",
  kaas: "Käse",
  jong: "jung",
  belegen: "mittelalt",
  eieren: "Eier",
  ei: "Ei",
  brood: "Brot",
  broodje: "Brötchen",
  broodjes: "Brötchen",
  volkoren: "Vollkorn",
  "volkoren brood": "Vollkornbrot",
  witbrood: "Weißbrot",
  "wit brood": "Weißbrot",
  bruinbrood: "Vollkornbrot",
  "bruin brood": "Vollkornbrot",
  crackers: "Cracker",
  beschuit: "Zwieback",
  appels: "Äpfel",
  appel: "Apfel",
  bananen: "Bananen",
  banaan: "Banane",
  sinaasappels: "Orangen",
  sinaasappel: "Orange",
  citroen: "Zitrone",
  citroenen: "Zitronen",
  druiven: "Trauben",
  aardbeien: "Erdbeeren",
  tomaten: "Tomaten",
  tomaat: "Tomate",
  komkommer: "Gurke",
  paprika: "Paprika",
  sla: "Salat",
  ijsbergsla: "Eisbergsalat",
  spinazie: "Spinat",
  wortel: "Karotte",
  wortelen: "Karotten",
  wortels: "Karotten",
  ui: "Zwiebel",
  uien: "Zwiebeln",
  knoflook: "Knoblauch",
  aardappelen: "Kartoffeln",
  aardappels: "Kartoffeln",
  aardappel: "Kartoffel",
  rijst: "Reis",
  pasta: "Pasta",
  spaghetti: "Spaghetti",
  noedels: "Nudeln",
  olie: "Öl",
  olijfolie: "Olivenöl",
  azijn: "Essig",
  zout: "Salz",
  peper: "Pfeffer",
  suiker: "Zucker",
  meel: "Mehl",
  bloem: "Mehl",
  bakpoeder: "Backpulver",
  gist: "Hefe",
  koffie: "Kaffee",
  thee: "Tee",
  water: "Wasser",
  bruiswater: "Sprudelwasser",
  sap: "Saft",
  appelsap: "Apfelsaft",
  sinaasappelsap: "Orangensaft",
  frisdrank: "Limonade",
  cola: "Cola",
  bier: "Bier",
  wijn: "Wein",
  vlees: "Fleisch",
  kip: "Hähnchen",
  kipfilet: "Hähnchenbrust",
  gehakt: "Hackfleisch",
  spek: "Speck",
  ham: "Schinken",
  worst: "Wurst",
  frankfurter: "Frankfurter",
  vis: "Fisch",
  zalm: "Lachs",
  tonijn: "Thunfisch",
  broodbeleg: "Brotaufstrich",
  hagelslag: "Schokoladenstreusel",
  pindakaas: "Erdnussbutter",
  jam: "Marmelade",
  honing: "Honig",
  nutella: "Nutella",
  chocolade: "Schokolade",
  koekjes: "Kekse",
  cake: "Kuchen",
  chips: "Chips",
  noten: "Nüsse",
  amandelen: "Mandeln",
  soep: "Suppe",
  bouillon: "Brühe",
  ketchup: "Ketchup",
  mayonaise: "Mayonnaise",
  mosterd: "Senf",
  sauzen: "Saucen",
  saus: "Sauce",
  pittig: "scharf",
  zoet: "süß",
  zoutig: "salzig",
  biologisch: "bio",
  toiletpapier: "Toilettenpapier",
  keukenpapier: "Küchenpapier",
  afwasmiddel: "Spülmittel",
  wasmiddel: "Waschmittel",
  zeep: "Seife",
  shampoo: "Shampoo",
  tandenborstel: "Zahnbürste",
  tandpasta: "Zahnpasta",
  vuilniszakken: "Müllbeutel",
  tassen: "Taschen",
  tas: "Tasche",
};

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string>>();

function cacheKey(text: string): string {
  return text.trim().toLowerCase();
}

function fromDictionary(text: string): string | null {
  return GROCERY_NL_DE[cacheKey(text)] ?? null;
}

async function fetchMyMemory(text: string): Promise<string | null> {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", "nl|de");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    responseStatus?: number | string;
    responseData?: { translatedText?: string };
  };

  if (Number(data.responseStatus) !== 200) return null;
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || /mymemory warning/i.test(translated)) return null;
  return translated;
}

const LIBRE_ENDPOINTS = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
];

async function fetchLibreTranslate(text: string): Promise<string | null> {
  for (const endpoint of LIBRE_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "nl",
          target: "de",
          format: "text",
        }),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { translatedText?: string };
      const translated = data.translatedText?.trim();
      if (translated) return translated;
    } catch {
      // try next endpoint
    }
  }
  return null;
}

async function resolveTranslation(text: string): Promise<string> {
  try {
    const viaMyMemory = await fetchMyMemory(text);
    if (viaMyMemory) return viaMyMemory;
  } catch {
    // network / DNS failure — try next
  }

  try {
    const viaLibre = await fetchLibreTranslate(text);
    if (viaLibre) return viaLibre;
  } catch {
    // network / DNS failure — try dictionary
  }

  return fromDictionary(text) ?? text;
}

/**
 * Translate a Dutch phrase to German.
 * Cached per process; never throws — returns original on total failure.
 */
export async function translateToGerman(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const key = cacheKey(trimmed);
  const cached = cache.get(key);
  if (cached != null) return cached;

  // Fast path for known groceries (also used when APIs are unreachable).
  const dictHit = fromDictionary(trimmed);
  if (dictHit != null) {
    cache.set(key, dictHit);
    return dictHit;
  }

  let pending = inflight.get(key);
  if (!pending) {
    pending = (async () => {
      try {
        const value = await resolveTranslation(trimmed);
        cache.set(key, value);
        return value;
      } catch {
        const fallback = fromDictionary(trimmed) ?? trimmed;
        cache.set(key, fallback);
        return fallback;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, pending);
  }

  return pending;
}

/** Translate name + note on each item; addedBy stays as-is. */
export async function translateItems<T extends TranslatableItem>(
  items: T[],
): Promise<T[]> {
  if (items.length === 0) return items;

  const names = await Promise.all(items.map((item) => translateToGerman(item.name)));
  const notes = await Promise.all(
    items.map((item) =>
      item.note?.trim()
        ? translateToGerman(item.note)
        : Promise.resolve(item.note),
    ),
  );

  return items.map((item, i) => ({
    ...item,
    name: names[i] || item.name,
    note: item.note?.trim() ? notes[i] || item.note : item.note,
  }));
}
