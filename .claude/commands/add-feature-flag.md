Add a new feature flag to CampusHub that gates both a backend API endpoint and the corresponding frontend UI.

The user will provide: a short flag name in SCREAMING_SNAKE_CASE (e.g. `COURSE_RATINGS`), a human-readable label, and a description of what the feature controls.

## Backend — Togglz

### 1. Add the enum constant

Open `backend/backend/src/main/java/com/campushub/backend/configurations/togglz/Features.java`.

Add the new constant in the section matching the domain:
```java
@Label("DOMAIN - FeatureName")
@EnabledByDefault
MY_NEW_FLAG,
```

### 2. Guard the controller method(s)

In every controller method that should be gated, add this check at the very top of the method body (before any other logic):
```java
if (!featureManager.isActive(MY_NEW_FLAG)) {
    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
}
```

The Togglz admin console is accessible at `/togglz-console`. Flags can be toggled live without restarting the server.

---

## Frontend — VITE_ENABLE_* env var

### 1. Register the flag

Open `campus-hub/src/config/features.js`.

Add the new entry to the `FEATURE_FLAGS` export object:
```js
myNewFeature: readBooleanEnv(import.meta.env.VITE_ENABLE_MY_NEW_FEATURE, true),
```
The second argument is the default value when the env var is absent. Use `true` for features that should be on by default in development.

### 2. Gate UI elements

In any component that should be hidden when the flag is off:
```jsx
import { FEATURE_FLAGS } from "../config/features";
// In JSX:
{FEATURE_FLAGS.myNewFeature && <MyFeatureUI />}
```

### 3. Gate routes

In `campus-hub/src/App.jsx`, add the route with a flag guard:
```jsx
<Route
  path="/my-feature"
  element={FEATURE_FLAGS.myNewFeature ? <MyFeaturePage /> : <Navigate to="/" replace />}
/>
```

### 4. Document the env var

Note that the following should be added to `campus-hub/.env.local` for local development:
```
VITE_ENABLE_MY_NEW_FEATURE=true
```

And to `docker-compose.yml` under the `frontend` service's `environment` block for production:
```yaml
- VITE_ENABLE_MY_NEW_FEATURE=true
```

---

## Summary

After completing all changes, list:
- The Togglz constant added and which controller methods it guards
- The `FEATURE_FLAGS` key added and which routes/components it gates
- The env var name that controls the frontend flag
