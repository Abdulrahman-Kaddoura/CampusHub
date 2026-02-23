import { buildApiUrl, buildAuthHeaders } from "./client";

const BASE_PATH = "/api/course-exchange";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export const fetchCourseExchangePosts = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-course-exchanges`), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response, "Failed to fetch course exchange posts");
};

export const createCourseExchangePost = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-course-exchange`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create course exchange post");
};
