import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/dorm";


export const fetchDormListings = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-dorms`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch dorm listings");
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
