const BASE_URL = "/api/listingImage";

/**
 * Upload an image for a listing. Call after creating the listing to attach an image.
 * @param {string} listingId - UUID of the listing
 * @param {File} file - image file (e.g. from input type="file")
 * @param {string} [token] - JWT for auth
 */
export const uploadListingImage = async (listingId, file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-listing-image/${listingId}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload image");
  }

  return await response.json();
};
