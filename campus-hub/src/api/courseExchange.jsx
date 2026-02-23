const BASE_URL = "/api/course-exchange";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export const fetchCourseExchangePosts = async () => {
  const response = await fetch(`${BASE_URL}/get-course-exchanges`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response, "Failed to fetch course exchange posts");
};

export const createCourseExchangePost = async (payload, token) => {
  const response = await fetch(`${BASE_URL}/create-course-exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create course exchange post");
};
