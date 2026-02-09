const BASE_URL = "/api";

export const fetchListings = async () => {
  const response = await fetch(`${BASE_URL}/listings/get-listings`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch listings.");
  }

  return response.json();
};

export const createListing = async (payload) => {
  const response = await fetch(`${BASE_URL}/listings/create-listing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create listing.");
  }

  return response.json();
};