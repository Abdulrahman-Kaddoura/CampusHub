import { buildApiUrl, buildAuthHeaders } from "./client";
import { AUTH_TOKEN_STORAGE_KEY } from "./constants";

const BASE_PATH = "/api/auth";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export { AUTH_TOKEN_STORAGE_KEY };

export const registerUser = async (payload) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/register`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to register user");
};

export const loginUser = async (payload) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/login`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to login");
};

export const fetchCurrentUser = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/me`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
  });

  return parseResponse(response, "Failed to fetch current user");
};
