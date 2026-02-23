import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";
import { AUTH_TOKEN_STORAGE_KEY } from "./constants";

const BASE_PATH = "/api/auth";

export { AUTH_TOKEN_STORAGE_KEY };

export const registerUser = async (payload) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/register`), {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to register user");
};

export const loginUser = async (payload) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/login`), {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to login");
};

export const logoutUser = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/logout`), {
    method: "POST",
    headers: buildJsonHeaders(),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to logout");
};

export const fetchCurrentUser = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/me`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to fetch current user");
};
