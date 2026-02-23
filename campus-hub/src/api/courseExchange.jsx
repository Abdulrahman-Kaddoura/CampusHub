import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/course-exchange";


export const fetchCourseExchangePosts = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-course-exchanges`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch course exchange posts");
};

export const createCourseExchangePost = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-course-exchange`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to create course exchange post");
};
