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
  const url = buildApiUrl(`${BASE_PATH}/create-listing`);
  const headers = buildJsonHeaders(token);
  // DEBUG: log the full request being made to help diagnose 403 errors
  console.debug("[DEBUG] createListing: POST", url);
  console.debug("[DEBUG] createListing: payload =", { ...payload });
  console.debug("[DEBUG] createListing: has Authorization header =", Boolean(headers.Authorization));
  console.debug("[DEBUG] createListing: has X-XSRF-TOKEN header =", Boolean(headers["X-XSRF-TOKEN"]));

  const response = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  // DEBUG: log the raw response status to confirm what the backend returned
  console.debug("[DEBUG] createListing: response status =", response.status, response.statusText);
  if (response.status === 403) {
    console.debug("[DEBUG] createListing: 403 FORBIDDEN — possible causes: missing/invalid JWT, missing CSRF token, feature toggle disabled, or userId mismatch");
  }

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
