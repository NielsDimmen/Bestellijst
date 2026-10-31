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

De app luistert in de container op poort **3000**. Standaard hostpoort is **8300** (`3000/tcp: 8300`), zodat die niet botst met andere diensten op 3000. De hostpoort kun je wijzigen onder de add-on **Configuration → Network**. Open via “Open web UI” of `http://homeassistant.local:8300`.

## Persistentie & backup

SQLite staat op `/data/bestellijst.db` (overleeft updates). Maak een backup van die file of gebruik HA’s add-on backup. `auth_secret` staat in `/data/auth_secret` als je die niet in de opties zet.
