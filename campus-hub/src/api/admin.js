import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/admin";

export const fetchAdminDashboard = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/dashboard`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch admin dashboard");
};

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
