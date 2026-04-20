import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/dorm";


export const fetchDormListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-dorms`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch dorm listings");
};

export const fetchDormListingsByUser = async (userId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-dorms-by-user/${userId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to fetch your dorm listings");
};

export const createDormListing = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-dorm`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to create dorm listing");
};

export const updateDormListing = async (dormId, payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/update-dorm/${dormId}`), {
    method: "PUT",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to update dorm listing");
};

export const deleteDormListing = async (dormId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/delete-dorm/${dormId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to delete dorm listing");
};
