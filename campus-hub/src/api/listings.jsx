import { buildApiUrl, buildAuthHeaders } from "./client";

const BASE_PATH = "/api/listings";

export const fetchListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-listings`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch listings");
  }

  return response.json();
};

export const createListing = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-listing`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create listing");
  }

  return response.json();
};
