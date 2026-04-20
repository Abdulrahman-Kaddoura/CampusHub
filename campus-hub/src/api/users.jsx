import { v4 as uuidv4 } from "uuid";
import { buildApiUrl, buildAuthHeaders, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/user";
const TEMP_USER_STORAGE_KEY = "campusHubTempUserId";

const buildTempUserPayload = () => {
  const randomId = crypto?.randomUUID?.() || uuidv4();
  const username = `temp${randomId}`;

  return {
    username,
    firstName: "Temp",
    lastName: "User",
    email: `${username}@example.com`,
    phoneNumber: "0000000000",
    password: `TempPass-${randomId}`,
  };
};

export const createTempUser = async () => {
  const storedUserId = localStorage.getItem(TEMP_USER_STORAGE_KEY);
  if (storedUserId) {
    return storedUserId;
  }

  const response = await fetch(buildApiUrl(`${BASE_PATH}/create-user`), {
    method: "POST",
    headers: buildJsonHeaders(),
    body: JSON.stringify(buildTempUserPayload()),
  });

  const data = await parseApiResponse(response, "Failed to create a temporary user.");
  const userId = data?.id;
  if (!userId) {
    throw new Error("Temporary user creation did not return a user ID.");
  }

  localStorage.setItem(TEMP_USER_STORAGE_KEY, userId);
  return userId;
};

export const uploadProfilePicture = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(buildApiUrl(`${BASE_PATH}/profile-picture/upload`), {
    method: "POST",
    headers: buildAuthHeaders(token),
    credentials: "include",
    body: formData,
  });
  return parseApiResponse(response, "Failed to upload profile picture");
};

export const updateUserProfile = async ({ firstName, lastName, phoneNumber }, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/update-profile`), {
    method: "PUT",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ firstName, lastName, phoneNumber: phoneNumber || null }),
  });
  return parseApiResponse(response, "Failed to update profile");
};

export const deleteProfilePicture = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/profile-picture`), {
    method: "DELETE",
    headers: buildAuthHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to delete profile picture");
};
