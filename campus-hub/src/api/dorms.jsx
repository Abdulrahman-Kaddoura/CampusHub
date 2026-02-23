import { buildApiUrl, buildAuthHeaders } from "./client";

const BASE_PATH = "/api/dorm";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export const fetchDormListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-dorms`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response, "Failed to fetch dorm listings");
};

export const createDormListing = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-dorm`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create dorm listing");
};
