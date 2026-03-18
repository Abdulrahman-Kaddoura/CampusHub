import { AUTH_TOKEN_STORAGE_KEY } from "./constants";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();
const ENV_API_TOKEN = (import.meta.env.VITE_API_TOKEN || "").trim();

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value) => value.replace(/^\/+/, "");

const readCookieValue = (name) => {
  if (typeof document === "undefined") {
    return "";
  }

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
};


export const buildApiUrl = (path) => {
  if (!API_BASE_URL) {
    return path;
  }

  const normalizedBase = trimTrailingSlash(API_BASE_URL);
  const normalizedPath = trimLeadingSlash(path);
  return `${normalizedBase}/${normalizedPath}`;
};

export const resolveAuthToken = (token) => {
  if (token) {
    // DEBUG: token provided directly as argument
    console.debug("[DEBUG] resolveAuthToken: using token passed as argument");
    return token;
  }

  const tokenFromStorage = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (tokenFromStorage) {
    // DEBUG: token found in localStorage
    console.debug("[DEBUG] resolveAuthToken: using token from localStorage");
    return tokenFromStorage;
  }

  if (ENV_API_TOKEN) {
    // DEBUG: falling back to env var token
    console.debug("[DEBUG] resolveAuthToken: using token from VITE_API_TOKEN env var");
    return ENV_API_TOKEN;
  }

  // DEBUG: no token found from any source — request will be unauthenticated
  console.debug("[DEBUG] resolveAuthToken: NO token found (arg, localStorage, or env var) — request will be unauthenticated");
  return ENV_API_TOKEN;
};

export const buildAuthHeaders = (token) => {
  const resolvedToken = resolveAuthToken(token);
  if (!resolvedToken) {
    // DEBUG: Authorization header will be omitted — backend will reject as 401/403
    console.debug("[DEBUG] buildAuthHeaders: no token resolved, Authorization header will NOT be set");
  }
  return resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {};
};

export const buildCsrfHeaders = () => {
  const csrfToken = readCookieValue("XSRF-TOKEN");
  if (!csrfToken) {
    // DEBUG: CSRF token missing — Spring Security will reject POST/PUT/DELETE with 403 FORBIDDEN
    console.debug("[DEBUG] buildCsrfHeaders: XSRF-TOKEN cookie not found — X-XSRF-TOKEN header will NOT be set, POST requests may fail with 403");
  } else {
    console.debug("[DEBUG] buildCsrfHeaders: XSRF-TOKEN cookie found, X-XSRF-TOKEN header will be included");
  }
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

export const buildJsonHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
    ...buildAuthHeaders(token),
    ...buildCsrfHeaders(),
  };
  // DEBUG: log final headers (mask Authorization value for security)
  const debugHeaders = { ...headers };
  if (debugHeaders.Authorization) {
    debugHeaders.Authorization = `Bearer [MASKED - length: ${headers.Authorization.length - 7}]`;
  }
  console.debug("[DEBUG] buildJsonHeaders: final headers =", debugHeaders);
  return headers;
};

export const parseApiResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson) {
      const jsonMessage = body?.message || body?.error;
      throw new Error(jsonMessage || fallbackMessage);
    }

    throw new Error(body || fallbackMessage);
  }

  return body;
};
