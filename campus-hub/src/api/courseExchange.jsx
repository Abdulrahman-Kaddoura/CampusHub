import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/course-exchange";


export const fetchCourseExchangePosts = async () => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-course-exchanges`), {
    method: "GET",
    headers: buildJsonHeaders(),
  });

  return parseApiResponse(response, "Failed to fetch course exchange posts");
};

export const fetchCourseExchangePostsByUser = async (userId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/get-course-exchanges-by-user/${userId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to fetch your course exchange posts");
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

export const updateCourseExchangePost = async (courseExchangeId, payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/update-course-exchange/${courseExchangeId}`), {
    method: "PUT",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to update course exchange post");
};

export const deleteCourseExchangePost = async (courseExchangeId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/delete-course-exchange/${courseExchangeId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to delete course exchange post");
};
