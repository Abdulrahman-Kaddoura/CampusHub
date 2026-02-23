import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";
import { AUTH_TOKEN_STORAGE_KEY } from "./constants";

const BASE_PATH = "/api/auth";
const FALLBACK_BASE_PATH = "/auth";

export { AUTH_TOKEN_STORAGE_KEY };

const sendAuthRequest = async (path, options) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}${path}`), options);

  if (response.status !== 404) {
    return response;
  }

  return fetch(buildApiUrl(`${FALLBACK_BASE_PATH}${path}`), options);
};

export const registerUser = async (payload) => {
  const response = await sendAuthRequest("/register", {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to register user");
};

export const loginUser = async (payload) => {
  const response = await sendAuthRequest("/login", {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to login");
};

export const logoutUser = async () => {
  const response = await sendAuthRequest("/logout", {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to logout");
};

export const fetchCurrentUser = async (token) => {
  const response = await sendAuthRequest("/me", {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to fetch current user");
};
