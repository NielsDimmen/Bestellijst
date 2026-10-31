# Bus 2 Boodschappenlijst

## Install

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Seed creates an approved admin (`username`: `admin`). Password comes from `ADMIN_PASSWORD` if set, otherwise a generated password is printed to the console.

**Auth note:** login codes are gone. Users register with username/password, then an admin must approve before they can log in. For a fresh SQLite DB in early/dev, `npx prisma migrate reset` (or delete `./data/bestellijst.db` and remigrate + seed) is fine.

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path. Local: `file:../data/bestellijst.db` (resolves to `./data/bestellijst.db`). Docker: `file:/app/data/bestellijst.db` |
| `AUTH_SECRET` | Secret for session/security (required in production) |
| `ADMIN_PASSWORD` | Optional. Password for the seeded `admin` user; if omitted, seed prints a generated password |
| `CATERING_PHONE` | Optional. Seeded as Setting `cateringPhone` (fallback if admin setting empty). Used for the WhatsApp `wa.me` deeplink when closing a list |

## Auth flow

1. User registers (naam + gebruikersnaam + wachtwoord) → account is **pending** (`approved: false`)
2. Admin opens portal → **Goedkeuren** or **Weigeren** (reject deletes the user)
3. Approved users log in with gebruikersnaam + wachtwoord (httpOnly session cookie, 30 days)

Closing a list (admin **Verstuur**) always marks the list SENT, opens a new ACTIVE list, and returns copyable plaintext. When a catering phone is set (admin setting or `CATERING_PHONE`), the response also includes a `wa.me` deeplink with the list prefilled — no Meta/Cloud API tokens needed.

## Docker

```bash
# Ensure AUTH_SECRET is set in the environment or a .env file
docker compose up --build -d
```

App listens on port **3000**. Database file is persisted in `./data` via volume mount.

## Home Assistant add-on

This repository is a Home Assistant **custom add-on repository**.

1. **Settings → Add-ons → Add-on store → ⋮ → Repositories**
2. Add: `https://github.com/NielsDimmen/Bestellijst`
3. Install **Bus 2 Bestellijst** from the store (Supervisor builds from `bestellijst/`; the Dockerfile clones this repo)

See [`bestellijst/README.md`](bestellijst/README.md) for options, host port **8300** (container 3000), and `/data` backup notes.

Offline fallback only: `./scripts/pack-local-addon.sh /addons/bestellijst`

## Database backup

Stop writes briefly if needed, then copy the SQLite file:

```bash
cp ./data/bestellijst.db ./data/bestellijst-backup-$(date +%Y%m%d).db
```

Or from a running container:

```bash
docker compose exec app cat /app/data/bestellijst.db > ./data/bestellijst-backup-$(date +%Y%m%d).db
```
