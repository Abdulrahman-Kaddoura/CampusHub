const BASE_URL = "/api";
const TEMP_USER_STORAGE_KEY = "campusHubTempUserId";

const buildTempUserPayload = () => {
  const randomId = crypto.randomUUID();
  const username = `temp_${randomId}`;

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

  const response = await fetch(`${BASE_URL}/user/create-user`, {
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