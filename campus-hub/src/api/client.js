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
    return token;
  }

  const tokenFromStorage = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (tokenFromStorage) {
    return tokenFromStorage;
  }

  return ENV_API_TOKEN;
};

export const buildAuthHeaders = (token) => {
  const resolvedToken = resolveAuthToken(token);
  return resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {};
};

export const buildCsrfHeaders = () => {
  const csrfToken = readCookieValue("XSRF-TOKEN");
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

export const buildJsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...buildAuthHeaders(token),
  ...buildCsrfHeaders(),
});

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
