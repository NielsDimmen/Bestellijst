# Bus 2 — ontwerp

Look: crew laminate. Donker, één gele accentkleur, groot condensed woordmerk. Rustig en functioneel. Geen versiering.

## Kleuren
Zie `reference/tokens.css`.

| Token | Hex | Gebruik |
|---|---|---|
| bg | #1B1B1B | achtergrond |
| surface | #262626 | invoervelden |
| line | #2E2E2E | lijnen tussen items |
| line-strong | #3A3A3A | rand invoervelden |
| text | #F5F4F0 | tekst |
| text-dim | #C9C6BE | labels |
| text-muted | #8F8C85 | wie, secundair |
| accent | #F2C200 | knoppen, BUS 2-tag, aantallen |
| ink | #111111 | tekst op geel |
| paper | #F5F4F0 | laminate-kaart |
| danger | #FF6B5A | foutmelding |

Geel alleen voor: primaire knop, + knop, BUS 2-tag, aantallen, focus-ring. Nergens anders.

## Typografie
- **Barlow Condensed 800**: alleen het woordmerk (BUS 2-tag, laminate).
- **Barlow 400/500/600**: al het andere.
- Body 18px. Labels 15px. Secundair 14px.
- Gewone zinsbouw (Inloggen, Gebruikersnaam). Geen hoofdletters met letter-spacing, geen monospace.

## Componenten
- Invoerveld: 52px hoog, radius 8px, surface + 1px line-strong. Focus: 2px gele outline.
- Primaire knop: 52px, geel, ink tekst, Barlow 600 18px.
- + knop: 52×52, geel, plus-icoon in ink.
- Lijstregel: aantal (geel, 600) · naam (500) · wie (muted, 14px). 1px lijn eronder. Geen kaartjes.
- Header: 60px, BUS 2-tag links, gebruikersnaam rechts. Sticky.

## Assets (`assets/`)
| Bestand | Waarvoor |
|---|---|
| logo-laminate.svg / .png | volledig logo |
| lockup-wide.svg / .png | breed logo |
| tag-bus2.svg | BUS 2-tag (mag ook in CSS) |
| icon.svg | app-icoon bron |
| favicon.svg, favicon-32.png | favicon |
| apple-touch-icon.png | 180×180 iOS |
| icon-192.png, icon-512.png | PWA manifest |
| icon-maskable-512.png | PWA maskable |

Tekst in de SVG's is omgezet naar paden, dus geen font nodig.

## Schermen (`reference/`)
- `login.html`: kleine laminate bovenaan, gebruikersnaam, wachtwoord, Inloggen.
- `list.html`: header, aantal + invoerveld + gele +, platte lijst (geel aantal per regel).
