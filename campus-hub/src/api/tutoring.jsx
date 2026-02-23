import { buildApiUrl, buildAuthHeaders } from "./client";

const BASE_PATH = "/api/tutoring";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export const fetchTutoringPosts = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-tutoring`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response, "Failed to fetch tutoring posts");
};

export const createTutoringPost = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-tutoring`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create tutoring post");
};
