import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/reviews";

export const createReview = async ({ listingId, rating, comment }, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ listingId, rating, comment }),
  });
  return parseApiResponse(response, "Failed to submit review");
};

export const getReviewsForUser = async (userId) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/user/${userId}`), {
    method: "GET",
    headers: buildJsonHeaders(),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch reviews");
};

export const canReviewListing = async (listingId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/can-review/${listingId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to check review eligibility");
};
