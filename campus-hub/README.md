# CampusHub Frontend

This is the Vite + React frontend for CampusHub.

## Run locally

```bash
cd campus-hub
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Then open: <http://localhost:4173>

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

