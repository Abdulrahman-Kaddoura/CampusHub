# CampusHub Frontend

This is the Vite + React frontend for CampusHub.

## Run locally

```bash
cd campus-hub
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Then open: <http://localhost:4173>

## Environment variables

Create a local env file before running the frontend:

```bash
cd campus-hub
cp .env.example .env
```

Set these variables in `.env`:

- `VITE_BACKEND_URL` (recommended): backend URL used by the Vite `/api` proxy in development.
  - Example: `http://localhost:9090`
- `VITE_API_BASE_URL` (optional): absolute API base URL prepended to frontend requests.
  - Leave empty in local dev to use relative `/api/*` requests through the Vite proxy.
  - Example: `https://api.your-domain.com`
- `VITE_API_TOKEN` (optional): static bearer token fallback for API calls that require auth when no user token is passed/stored.
  - Intended for local testing.
- `VITE_BASE_PATH` (optional): base path when hosting under a subdirectory (for example `/campus-hub/`).

Defaults:

- If `VITE_BACKEND_URL` is not set, Vite proxy target defaults to `http://localhost:9090`.
- If `VITE_API_BASE_URL` is not set, requests use relative `/api/*` paths.

## Available routes

- `/` → Marketplace home
- `/marketplace/category/:categoryName` → Marketplace category page
- `/tutoring` → Tutoring page
- `/housing` → Housing page
- `/courseexchange` → Course Exchange page
- `/auth` → Login/Register page
- `/profile` → Profile page

## Keep viewing the frontend yourself

Once the dev server is running, keep it open in one terminal tab/window. In another tab/window you can:

- Refresh the browser to see changes instantly (Vite hot reload).
- Navigate directly to any route above.
- Stop the app anytime with `Ctrl + C` in the terminal running `npm run dev`.

