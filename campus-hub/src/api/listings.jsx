import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/listings";

export const fetchListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-listings`), {
    method: "GET",
    headers: buildJsonHeaders(),
    credentials: "include",
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

export const buyListing = async (listingId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/buy-listing/${listingId}`), {
    method: "PUT",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to mark listing as purchased");
};

export const fetchListingsByUser = async (userId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-listings-by-user/${userId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to fetch your listings");
};

export const updateListing = async (listingId, payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/update-listing/${listingId}`), {
    method: "PUT",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to update listing");
};

export const deleteListing = async (listingId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/delete-listing/${listingId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to delete listing");
};

export const createStripeCheckoutSession = async (
  listingId,
  { successUrl, cancelUrl } = {},
  token
) => {
  if (!token) {
    throw new Error("You need to log in again before starting Stripe checkout.");
  }

  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-checkout-session/${listingId}`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ successUrl, cancelUrl }),
  });

  return parseApiResponse(response, "Failed to create Stripe checkout session");
};


export const fetchAiListingMatches = async (query, limit = 25) => {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });

  const response = await fetch(buildApiUrl(`${BASE_PATH}/ai-search?${params.toString()}`), {
    method: "GET",
    headers: buildJsonHeaders(),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to run AI listing search");
};
