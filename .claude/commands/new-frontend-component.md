Create a new React component or page for the CampusHub frontend.

The user will provide: the component name (PascalCase), whether it is a shared component (`components/`) or a route-level page (`pages/`), what it should display or do, and any API calls it needs to make.

Follow these steps exactly:

## Step 1 — Determine the location

- Shared/reusable UI → `campus-hub/src/components/<ComponentName>.jsx`
- Route-level page → `campus-hub/src/pages/<ComponentName>/<ComponentName>.jsx`
  - Create the subdirectory if it does not exist

## Step 2 — Create the CSS file

Create `<ComponentName>.css` in the same directory as the JSX file.
Import it at the top of the JSX file:
```js
import "./<ComponentName>.css";
```

## Step 3 — Component scaffold

Use a **named export** for shared components, a **default export** for pages:

```jsx
// Shared component — named export
export const ComponentName = ({ prop1, prop2 }) => {
  return (
    <div className="component-name">
      {/* content */}
    </div>
  );
};

// Page — default export
export default function PageName() {
  return (
    <div className="page-name">
      {/* content */}
    </div>
  );
}
```

## Step 4 — Authentication

If the component needs to identify the current user or send authenticated requests, import `useAuth()`:

```jsx
import { useAuth } from "../../context/AuthContext";  // adjust relative path for actual depth
const { currentUser, token, isAuthenticated } = useAuth();
```

## Step 5 — API calls

If the component fetches or mutates data:

1. Check whether a suitable function already exists in `campus-hub/src/api/`. Use it if one exists.
2. If a new function is needed, add it to the appropriate file in `campus-hub/src/api/`. Follow the existing pattern exactly:

```js
import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";
const BASE_PATH = "/api/<domain>";

export const myNewAction = async (param, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/my-endpoint/${param}`), {
    method: "GET",           // or POST, PUT, DELETE
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to perform action");
};
```

Always use `buildApiUrl`, `buildJsonHeaders`, and `parseApiResponse` from `./client`.
Always include `credentials: "include"` so cookies are sent.

## Step 6 — Feature flag (for new features)

If the new page should be behind a feature flag:
1. Open `campus-hub/src/config/features.js` and add a new entry reading a `VITE_ENABLE_<NAME>` env var. Default to `true` unless the feature is experimental.
2. Document the env var in `campus-hub/.env.local` (add a comment showing the var).

## Step 7 — Routing (pages only)

Open `campus-hub/src/App.jsx` and add the import and a new `<Route>`. If the route is feature-flagged, use the conditional redirect pattern already present:

```jsx
<Route
  path="/my-page"
  element={FEATURE_FLAGS.myFeature ? <MyPage /> : <Navigate to="/" replace />}
/>
```

## Step 8 — NavBar link (if needed)

Open `campus-hub/src/components/NavBar.jsx` and add a navigation link using React Router's `<Link>` component, consistent with the existing link styles.

---

After completing all steps, list every file created or modified.
