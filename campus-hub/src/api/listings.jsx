const BASE_URL = "/api/listings";

export const fetchListings = async () => {
  const response = await fetch(`${BASE_URL}/get-listings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch listings");
  }

  return await response.json();
};

export const createListing = async (payload, token) => {
  const response = await fetch(`${BASE_URL}/create-listing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create listing");
  }

  return await response.json();
};
