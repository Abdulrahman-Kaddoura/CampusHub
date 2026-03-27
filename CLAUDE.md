# CampusHub — AI Assistant Guide

## Project Overview

CampusHub is a full-stack student marketplace for the American University of Beirut (AUB) community.
Students can buy and sell textbooks, furniture, clothing, and other campus essentials. The platform
also offers housing listings (dorm sublets), tutoring services, and a course exchange board.

Payments are processed through Stripe Checkout. Authentication is JWT-based with email verification.
Every API endpoint is protected by a Togglz feature flag; flags are on by default.

The production domain is **campushub.shop** (HTTPS via Nginx reverse proxy).

---

## Tech Stack

| Layer          | Technology                                              |
|----------------|---------------------------------------------------------|
| Frontend       | React 19, Vite 7, Bootstrap 5, React Router DOM 7       |
| Backend        | Java 17, Spring Boot 4, Gradle (Groovy DSL)             |
| Database       | PostgreSQL (prod), H2 in-memory (tests only)            |
| Auth           | JWT via JJWT 0.11, Spring Security (stateless sessions) |
| Payments       | Stripe Java SDK 30.x, Stripe Checkout (redirect flow)   |
| Audit          | Hibernate Envers 6.2                                    |
| Feature Flags  | Togglz 4.4 (backend), VITE_ENABLE_* env vars (frontend) |
| API Docs       | SpringDoc OpenAPI / Swagger UI                          |
| Infrastructure | Docker Compose, Nginx (reverse proxy + TLS termination) |

---

## Repository Layout

```
CampusHub/
├── campus-hub/               # React frontend (Vite)
│   └── src/
│       ├── api/              # Fetch wrapper functions, one file per domain
│       ├── components/       # Shared/reusable UI components (with co-located CSS)
│       ├── config/           # features.js — VITE_ENABLE_* flag reader
│       ├── context/          # AuthContext.jsx — useAuth() hook and AuthProvider
│       ├── pages/            # Route-level components (MarketPlace/, Auth/, Profile/, etc.)
│       └── main.jsx          # Entry point; wraps app in AuthProvider + BrowserRouter
├── backend/backend/          # Spring Boot backend
│   └── src/
│       ├── main/java/com/campushub/backend/
│       │   ├── controllers/  # REST controllers, grouped by domain subdirectory
│       │   ├── services/     # Business logic, grouped by domain subdirectory
│       │   ├── repositories/ # Spring Data JPA repositories
│       │   ├── models/       # JPA entities (@Entity, @Audited, Lombok)
│       │   ├── dtos/         # Request/Response DTOs with Jakarta validation
│       │   ├── enums/        # ListingStatus, UserStatus, etc.
│       │   ├── exceptions/   # Custom exception classes
│       │   ├── security/     # SecurityConfig, JwtAuthenticationFilter, etc.
│       │   └── configurations/
│       │       └── togglz/   # Features.java enum, TogglzConfig.java
│       └── test/             # Mockito unit tests (no Spring context)
├── .claude/commands/         # Custom slash command skills for this project
├── docker-compose.yml        # Orchestrates backend1, frontend, nginx services
├── nginx.conf                # Reverse proxy: / → frontend:80, /api/ → backend1:9090
└── database/                 # Database init scripts
```

---

## Development Setup

### Prerequisites

- Java 17 (`java -version` must show 17)
- Node.js 20+ and npm
- PostgreSQL running locally, or use Docker Compose for the full stack

### Backend Environment Variables

Create a `.env` file at the project root (or export these before running `bootRun`):

```
# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/campushub
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=yourpassword

# Server
SERVER_PORT=9090
SERVER_ADDRESS=0.0.0.0

# JWT
JWT_SECRET_KEY=your-256-bit-secret
JWT_EXPIRATION_MS=86400000

# App URLs (used in email links)
APP_VERIFICATION_BASE_URL=http://localhost:5173
APP_PASSWORD_RESET_BASE_URL=http://localhost:5173
APP_MAIL_FROM=no-reply@campushub.shop

# Mail (SMTP)
SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=user
SPRING_MAIL_PASSWORD=pass
SPRING_MAIL_SMTP_AUTH=true
SPRING_MAIL_SMTP_STARTTLS_ENABLE=true

# Security
APP_SECURITY_COOKIE_SECURE=false
APP_SECURITY_CSRF_COOKIE_DOMAIN=localhost
```

### Frontend Environment Variables

Create `campus-hub/.env.local`:

```
VITE_BACKEND_URL=http://127.0.0.1:9090
VITE_ENABLE_AUTH=true
VITE_ENABLE_HOUSING=true
VITE_ENABLE_TUTORING=true
VITE_ENABLE_COURSE_EXCHANGE=true
VITE_USE_MOCK_DATA=false
```

---

## Common Commands

### Frontend (`cd campus-hub`)

```bash
npm install           # Install dependencies
npm run dev           # Start Vite dev server at http://localhost:5173
npm run build         # Production build into dist/
npm run lint          # Run ESLint
npm run preview       # Preview the production build locally
```

### Backend (`cd backend/backend`)

```bash
./gradlew test        # Run unit tests (H2 in-memory — no PostgreSQL needed)
./gradlew build       # Compile, test, and produce app.jar
./gradlew bootRun     # Start backend (requires env vars set)
```

### Full Stack (project root)

```bash
docker-compose up --build    # Build all images and start the full stack
docker-compose up            # Start without rebuilding
docker-compose down          # Stop and remove containers
```

---

## Architecture Patterns and Conventions

### Backend

**Layer structure — follow for every domain:**
1. `@Entity` model in `models/<domain>/`
2. Spring Data JPA `@Repository` interface in `repositories/<domain>/`
3. `@Service` class in `services/<domain>/` — all business logic here
4. Request/Response DTOs in `dtos/<domain>/` using Jakarta Bean Validation
5. `@RestController` in `controllers/<domain>/` — thin, delegates to services
6. Feature flag constant in `configurations/togglz/Features.java`

**Entity conventions:**
- UUID primary key: `@GeneratedValue(strategy = GenerationType.UUID)`
- Lombok `@Getter` and `@Setter` (avoid `@Data` on JPA entities)
- `@Audited` on entities that need change history (Hibernate Envers)
- `@PrePersist` / `@PreUpdate` for `createdAt` / `updatedAt` timestamps

**Controller conventions:**
- Class-level `@RequestMapping("/<domain>")` — no `/api/` prefix (Nginx adds it)
- Check Togglz flag at the top of every handler; return `403 FORBIDDEN` if disabled:
  ```java
  if (!featureManager.isActive(MY_FLAG)) {
      return new ResponseEntity<>(HttpStatus.FORBIDDEN);
  }
  ```
- Use `@Operation` and `@Tag` for Swagger documentation
- `modelMapper.map(entity, ResponseDTO.class)` for entity-to-DTO conversion
- `userService.getAuthenticatedUser()` to get the current JWT user

**Feature flags:**
- Add constants to `Features.java` with `@Label` and `@EnabledByDefault`
- Togglz console (live toggle without restart): `/togglz-console`

**Public endpoints** are whitelisted in `SecurityConfig.java` via `requestMatchers(...).permitAll()`. All others require a valid JWT Bearer token.

**Tests** use `@ExtendWith(MockitoExtension.class)` with `@Mock` / `@InjectMocks`. No Spring context is loaded; H2 is on the test classpath for any JPA tests.

### Frontend

**API client pattern** — every file in `campus-hub/src/api/` follows this structure:
```js
import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";
const BASE_PATH = "/api/<domain>";

export const someAction = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/some-endpoint`), {
    method: "POST",
    headers: buildJsonHeaders(token),   // includes Authorization + X-XSRF-TOKEN
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return parseApiResponse(response, "Fallback error message");
};
```

**Component conventions:**
- Named exports for shared components; default exports for pages
- Co-locate CSS: `MyComponent.jsx` + `MyComponent.css` in the same directory
- `useAuth()` from `../../context/AuthContext` for `currentUser`, `token`, `isAuthenticated`
- Shared UI → `campus-hub/src/components/`; route-level views → `campus-hub/src/pages/`

**Routing** is declared in `App.jsx`. New routes must also check `FEATURE_FLAGS.*` and redirect to `/` if disabled.

**Frontend feature flags** live in `campus-hub/src/config/features.js` and read `VITE_ENABLE_*` env vars.

**Dev proxy:** Vite proxies `/api/*` to `http://127.0.0.1:9090`. Never hardcode the backend URL.

---

## Key Local URLs

| Service         | URL                                          |
|-----------------|----------------------------------------------|
| Frontend        | http://localhost:5173                        |
| Backend API     | http://localhost:9090                        |
| Swagger UI      | http://localhost:9090/swagger-ui/index.html  |
| Togglz Console  | http://localhost:9090/togglz-console         |

---

## Notable Integrations

- **Stripe:** Checkout Session redirect flow. Frontend calls `POST /api/listings/create-checkout-session/{listingId}`, receives a `checkoutUrl`, and redirects the browser. On return, `?payment=success&listingId=...` triggers `buyListing()` to mark the listing as SOLD.
- **Hibernate Envers:** Entity changes are audited automatically for `@Audited` entities. Audit tables are created with an `_AUD` suffix.
- **Email verification:** Registration triggers a verification email. Users must verify before full access. The flow uses `POST /api/auth/verify-email` with an OTP code.

---

## Custom Skills

This project includes custom slash commands in `.claude/commands/`:

| Command                    | Purpose                                                  |
|----------------------------|----------------------------------------------------------|
| `/new-backend-endpoint`    | Scaffold a new REST endpoint with all required layers    |
| `/new-frontend-component`  | Create a new React component or page                     |
| `/run-tests`               | Run backend tests and frontend lint, summarize results   |
| `/add-feature-flag`        | Add a Togglz + VITE_ENABLE_* flag pair for a new feature |
