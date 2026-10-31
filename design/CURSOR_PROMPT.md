Pas het ontwerp van de app aan volgens de map `design/` in de root van dit project.

## Bronnen
- `design/DESIGN.md`: kleuren, typografie, componenten. Dit is leidend.
- `design/reference/tokens.css`: de tokens. Neem ze 1-op-1 over als CSS variables en koppel ze aan Tailwind (`theme.extend.colors`, `fontFamily`).
- `design/reference/login.html` en `design/reference/list.html`: zo moeten de schermen eruitzien. Bouw ze na in de bestaande componenten. Niet letterlijk de HTML kopiëren.
- `design/assets/`: logo en iconen. Kopieer wat nodig is naar `public/`.

## Doen
- Fonts self-hosted via `@fontsource/barlow-condensed` (700, 800) en `@fontsource/barlow` (400, 500, 600). Geen Google Fonts link.
- Dark is de enige modus. Geen light mode, geen toggle.
- Favicon, apple-touch-icon en een `manifest.webmanifest` (naam "Bus 2", `theme_color` en `background_color` #1B1B1B, icons 192/512 + maskable) zodat crew hem op hun homescreen kan zetten.
- Login: gebruikersnaam + wachtwoord, zoals `login.html`. Bij fout alleen "Klopt niet" onder de velden.
- Lijst: zoals `list.html`. Enter of + voegt toe. Eigen item bewerken/verwijderen via tik op de regel (simpel actiemenu of swipe, kies wat het minst code is).
- Admin-pagina's in dezelfde stijl: zelfde velden, knoppen en lijstregels. Niks nieuws verzinnen.
- Tikvlakken minimaal 44px. Werkt vanaf 360px breed, max-breedte content 560px.

## Niet doen
- Geen uitlegteksten, welkomstteksten, onboarding, tooltips of lege-staat-teksten. Lege lijst is gewoon leeg.
- Geen emoji, geen gradients, geen schaduwen, geen kaartjes met gekleurde linkerrand, geen icon-libraries erbij voor één icoon.
- Geen hoofdletters met letter-spacing en geen monospace. Barlow Condensed alleen voor het woordmerk.
- Geel alleen waar `DESIGN.md` het toestaat.
