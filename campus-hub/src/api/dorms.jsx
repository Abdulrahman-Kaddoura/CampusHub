const BASE_URL = "/api/dorm";

const parseResponse = async (response, fallbackMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || fallbackMessage);
  }

  return response.json();
};

export const fetchDormListings = async () => {
  const response = await fetch(`${BASE_URL}/get-dorms`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  return parseResponse(response, "Failed to fetch dorm listings");
};

export const createDormListing = async (payload, token) => {
  const response = await fetch(`${BASE_URL}/create-dorm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response, "Failed to create dorm listing");
};
