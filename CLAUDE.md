# CampusHub — Claude Code Guide

## Project Overview
CampusHub is a full-stack campus marketplace where students can buy/sell items, find tutoring, browse housing, and exchange courses.

- **Backend:** Java 17 + Spring Boot, PostgreSQL, JWT auth, Stripe payments
- **Frontend:** React 19 + Vite, React Router v7, Bootstrap 5
- **Infrastructure:** Docker Compose, Nginx (reverse proxy + SSL), GitHub Actions CI

---

## Key Commands

### Frontend (`campus-hub/`)
```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Backend (`backend/backend/`)
```bash
./gradlew build         # Compile and package
./gradlew test          # Run JUnit tests
./gradlew bootRun       # Start Spring Boot dev server (port 9090)
```

### Full Stack (repo root)
```bash
docker-compose up --build   # Start all services (backend, frontend, nginx, postgres)
```

---

## Architecture

### Backend Layers
```
controllers/   → REST endpoints (@RestController, @RequestMapping)
services/      → Business logic (injected into controllers)
repositories/  → Spring Data JPA (extend JpaRepository)
models/        → JPA entities (@Entity)
dtos/          → Request/response shapes (no entity exposure)
exceptions/    → Custom exceptions
security/      → JWT filter, Spring Security config
configurations/ → ModelMapper, Togglz feature flags, OpenAPI docs
enums/         → UserStatus, ListingStatus, etc.
util/          → Shared helpers
```

### Frontend Layers
```
pages/         → Full page components (MarketPlace, Auth, Profile, Housing, Tutoring, CourseExchange)
components/    → Reusable UI (NavBar, ProductCard, HeroCarousel)
api/           → Feature-scoped Axios wrappers (auth, listings, users, tutoring, dorms, courseExchange)
context/       → React Context (AuthContext for user session)
config/        → Feature flags (features.js — mirrors backend Togglz flags)
```

---

## Environment Setup

1. Copy `campus-hub/.env.example` → `campus-hub/.env` and fill in values.
2. Backend environment variables (database, JWT secret, Stripe key, mail config) are passed via Docker Compose or a local `.env` at `backend/backend/`.
3. API base URL defaults to `/api` via Vite proxy (`vite.config.js`).

---

## Conventions

### Backend
- All controllers return DTOs, never JPA entities directly.
- Services are `@Transactional` where needed.
- Use `ModelMapper` (configured in `configurations/`) for entity ↔ DTO mapping.
- New feature areas should have a corresponding Togglz feature flag.
- Tests live in `src/test/java/` and use an H2 in-memory DB (`application-test.yaml`).

### Frontend
- API calls go through `campus-hub/src/api/client.js` (Axios instance).
- Add new resource API functions to a matching file in `campus-hub/src/api/`.
- Feature availability is gated by `campus-hub/src/config/features.js`.
- Use React Router `<Link>` and `useNavigate` — no raw `<a>` tags for internal nav.

---

## Custom Skills
- `/new-endpoint` — Scaffold a full-stack REST endpoint (controller + service + DTO + frontend API call).
