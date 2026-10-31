# Bus 2 Bestellijst

Webapp voor de gedeelde boodschappen-/bestellijst.

Bron: [github.com/NielsDimmen/Bestellijst](https://github.com/NielsDimmen/Bestellijst)

## Configuratie

| Optie | Beschrijving |
|---|---|
| `auth_secret` | Secret voor sessies. Leeg laten: wordt eenmalig gegenereerd en bewaard in `/data/auth_secret`. |
| `catering_phone` | Optioneel. Telefoonnummer voor WhatsApp `wa.me` (bijv. `06…`). |
| `admin_password` | Optioneel. Wachtwoord voor de eerste `admin`-gebruiker bij seed. Leeg: gegenereerd wachtwoord in de add-on log. |

## Poort

De UI draait op poort **3000** (standaard gemapt naar hostpoort 3000). Open via de add-on “Open web UI” of `http://homeassistant.local:3000`.

## Persistentie & backup

SQLite staat op `/data/bestellijst.db` (overleeft updates). Maak een backup van die file of gebruik HA’s add-on backup. `auth_secret` staat in `/data/auth_secret` als je die niet in de opties zet.
