import { buildApiUrl, buildAuthHeaders } from "./client";

const BASE_PATH = "/api/listingImage";

/**
 * Upload an image for a listing. Call after creating the listing to attach an image.
 * @param {string} listingId - UUID of the listing
 * @param {File} file - image file (e.g. from input type="file")
 * @param {string} [token] - JWT for auth
 */
export const uploadListingImage = async (listingId, file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildApiUrl(`${BASE_PATH}/upload-listing-image/${listingId}`), {
    method: "POST",
    headers: {
      ...buildAuthHeaders(token),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to upload image");
  }

  return response.json();
};
