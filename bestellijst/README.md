# Home Assistant add-on: Bus 2 Bestellijst

Next.js Bestellijst-app op poort **3000**. SQLite + gegenereerde `AUTH_SECRET` blijven in `/data`.

## Installeren via GitHub-repository

1. In Home Assistant: **Settings → Add-ons → Add-on store**
2. Rechtsboven **⋮ → Repositories**
3. Voeg toe: `https://github.com/NielsDimmen/Bestellijst`
4. Sluit dialoog → vernieuw de store indien nodig
5. Open **Bus 2 Bestellijst** → **Install** (build kloont de app van GitHub; kan enkele minuten duren)
6. Options (optioneel `admin_password`, `catering_phone`) → **Start**
7. Open via **Open web UI** of `http://<ha-host>:3000`

## Opties

| Optie | Default | Betekenis |
|---|---|---|
| `auth_secret` | `""` | Session secret. Leeg → genereer + bewaar in `/data/auth_secret` |
| `catering_phone` | `""` | Optioneel WhatsApp-nummer |
| `admin_password` | `""` | Wachtwoord voor seed-user `admin`; leeg → random in de log |

## Data / backup

| Pad in container | Inhoud |
|---|---|
| `/data/bestellijst.db` | SQLite database |
| `/data/auth_secret` | Gegenereerde secret (als optie leeg was) |

Neem `/data` mee in HA-backups van deze add-on.

## Architectuur

- Supervisor-buildcontext = deze map (`bestellijst/`)
- Dockerfile kloont `https://github.com/NielsDimmen/Bestellijst` (`APP_REF`, default `main`) en bouwt Next standalone
- Runtime: HA `*-base-debian:bookworm` + bashio; bij start migrate → seed → `node server.js`

## Offline / local (alleen als GitHub niet bereikbaar is)

Zie [`scripts/pack-local-addon.sh`](../scripts/pack-local-addon.sh) — kopieert app + add-on overlay naar `/addons/bestellijst` voor Local add-ons.
