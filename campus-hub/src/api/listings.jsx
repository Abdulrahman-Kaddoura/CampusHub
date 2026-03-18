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
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-checkout-session/${listingId}`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ successUrl, cancelUrl }),
  });

  return parseApiResponse(response, "Failed to create Stripe checkout session");
};
