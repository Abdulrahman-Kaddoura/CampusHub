import { AUTH_TOKEN_STORAGE_KEY } from "./constants";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();
const ENV_API_TOKEN = (import.meta.env.VITE_API_TOKEN || "").trim();

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");
const trimLeadingSlash = (value) => value.replace(/^\/+/, "");

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
