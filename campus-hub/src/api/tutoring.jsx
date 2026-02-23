import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/tutoring";


export const fetchTutoringPosts = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-tutoring`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch tutoring posts");
};

export const createTutoringPost = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-tutoring`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to create tutoring post");
};
