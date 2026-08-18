# LearnICDL Web-App

## Architektur
- `backend/` PocketBase (Go + SQLite), regelt Anmeldung, DB, dateien (z.B. Bilder), Backend-/DB-Admin UI
- `frontend/` SvelteKit app, kommuniziert mit PocketBase via JS SDK (`pocketbase`), cookie-based auth (`hooks.server.ts`), "sichere" Frontend-Admin UI (derzeit nur für Fragen anlegen und bearbeiten)

## Starten
- `pnpm install`
- `pnpm dev` startet backend + frontend parallel

### Nur Frontend starten
- `cd frontend && pnpm dev`
- http://localhost:5173

### Nur Backend starten
- `cd backend && ./pocketbase serve`
- http://127.0.0.1:8090/_/ (im Browser, login mit superuser)

### Im Netzwerk starten (z.B. Zugriff vom Handy)
- `pnpm dev:lan` startet backend + frontend, Frontend ist zusätzlich im lokalen Netzwerk erreichbar (via `vite dev --host`)
- `http://192.168.x.x:5173/` auf dem Handy öffnen (gleiches WLAN)
- PocketBase selbst lauscht weiterhin nur auf `127.0.0.1` (nicht direkt im Netzwerk erreichbar). Ausnahme: Fragen-Bilder werden über einen Vite-Proxy (`/api/files` → `127.0.0.1:8090`) ausgeliefert, damit sie auf dem Handy laden und leitet nur `/api/files` weiter, nicht die gesamte PocketBase-API

## Datenmodell
Aktuelle Collections/Felder: PocketBase Admin UI (`http://127.0.0.1:8090/_/`) einsehbar.

### Fragen aus alter DB importieren
```bash
# 2. Dry run the import for one specific lesson (no writes). Find the
# LESSON.ID and the PocketBase module id you want it under first:
grep -a '"<lesson name>"' lesson.csv    # find its LESSON.ID

# look up the target module's PocketBase record id in the admin UI
node import.mjs --lesson=<LEGACY LESSON.ID> --module=<PocketBase module id>
```
PocketBase Modul id laesst sich neben dem Titel in der Modul/Quizübersicht im Admin-Panel ablesen!
für Modul Computer Grundlagen 2, sieht ein dry run so aus:
```bash
node import.mjs --lesson=1605794091000 --module=97ff2q5eqjzhpwi
```
Mit `--commit` werden die Fragen tatsaechlich geschrieben.:
```bash
node import.mjs --lesson=1605794091000 --module=97ff2q5eqjzhpwi --commit
```
Dafür benötigt es allerdings einen PocketBase superuser, diesen muss man vorher angelegt haben, sowie als Umgebungsvariable setzen; z.B. in bash:
```bash
export PB_EMAIL=<superuser email>
export PB_PASSWORD=<superuser password>
```
siehe [./backend/data-import/legacy-2026/README.md](./backend/data-import/legacy-2026/README.md) für Details.


## Zugang erstellen (app user)
- PocketBase admin UI → `users` collection → new/edit record → set email + password + role
- oder import `backend/csv_imports/test_users.csv` (altes Beispiel zum testen, password schon hashed)

## Login zum Backend (superuser)
- `cd backend && ./pocketbase superuser upsert <email> <password>`
