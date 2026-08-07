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

## Zugang erstellen (app user)
- PocketBase admin UI → `users` collection → new/edit record → set email + password + role
- oder import `backend/csv_imports/test_users.csv` (altes Beispiel zum testen, password schon hashed)

## Login zum Backend (superuser)
- `cd backend && ./pocketbase superuser upsert <email> <password>`
