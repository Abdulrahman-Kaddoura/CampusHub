import { v4 as uuidv4 } from "uuid";
import { buildApiUrl } from "./client";

const BASE_PATH = "/api/user";
const TEMP_USER_STORAGE_KEY = "campusHubTempUserId";

const buildTempUserPayload = () => {
  const randomId = crypto?.randomUUID?.() || uuidv4();
  const username = `temp${randomId}`;

  return {
    username,
    firstName: "Temp",
    lastName: "User",
    email: `${username}@exaple.com`,
    phoneNumber: "000000000",
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildTempUserPayload()),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create a temporary user.");
  }

  const data = await response.json();
  const userId = data?.id;
  if (!userId) {
    throw new Error("Temporary user creation did not return a user ID.");
  }

  localStorage.setItem(TEMP_USER_STORAGE_KEY, userId);
  return userId;
};
