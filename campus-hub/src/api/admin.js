import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/admin";

// ─── Analytics ───────────────────────────────────────────────────────────────

export const fetchAdminDashboard = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/dashboard`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch admin dashboard");
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const fetchAdminUsers = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/users`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch users");
};

export const updateUserStatus = async (userId, status, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/users/${userId}/status`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return parseApiResponse(response, "Failed to update user status");
};

export const updateUserRole = async (userId, role, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/users/${userId}/role`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  return parseApiResponse(response, "Failed to update user role");
};

// ─── Posts: Listings ─────────────────────────────────────────────────────────

export const fetchAdminListings = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/listings`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch listings");
};

export const adminDeleteListing = async (listingId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/listings/${listingId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || "Failed to delete listing");
  }
};

export const adminUpdateListing = async (listingId, data, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/listings/${listingId}`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApiResponse(response, "Failed to update listing");
};

// ─── Posts: Dorms ────────────────────────────────────────────────────────────

export const fetchAdminDorms = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/dorms`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch housing posts");
};

export const adminDeleteDorm = async (dormId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/dorms/${dormId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || "Failed to delete housing post");
  }
};

export const adminUpdateDorm = async (dormId, data, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/dorms/${dormId}`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApiResponse(response, "Failed to update housing post");
};

// ─── Posts: Tutoring ─────────────────────────────────────────────────────────

export const fetchAdminTutoring = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/tutoring`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch tutoring posts");
};

export const adminDeleteTutoring = async (tutoringId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/tutoring/${tutoringId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || "Failed to delete tutoring post");
  }
};

export const adminUpdateTutoring = async (tutoringId, data, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/tutoring/${tutoringId}`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApiResponse(response, "Failed to update tutoring post");
};

// ─── Posts: Course Exchange ───────────────────────────────────────────────────

export const fetchAdminCourseExchanges = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/course-exchange`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch course exchange posts");
};

export const adminDeleteCourseExchange = async (courseExchangeId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/course-exchange/${courseExchangeId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  if (!response.ok && response.status !== 204) {
    const text = await response.text();
    throw new Error(text || "Failed to delete course exchange post");
  }
};

export const adminUpdateCourseExchange = async (courseExchangeId, data, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/posts/course-exchange/${courseExchangeId}`), {
    method: "PATCH",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApiResponse(response, "Failed to update course exchange post");
};
