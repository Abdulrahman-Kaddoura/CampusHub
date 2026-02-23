import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/listings";

export const fetchListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-listings`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch listings");
};

export const createListing = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-listing`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to create listing");
};
