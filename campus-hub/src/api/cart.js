import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const CART_BASE = "/api/cart";
const CART_ITEM_BASE = "/api/cart-item";

export const getCartByUserId = async (userId, token) => {
  const response = await fetch(buildApiUrl(`${CART_BASE}/get-cart-by-user-id/${userId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch cart");
};

export const addItemToCart = async (listingId, token) => {
  const response = await fetch(buildApiUrl(`${CART_BASE}/add-item`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ listingId }),
  });
  return parseApiResponse(response, "Failed to add item to cart");
};

export const removeCartItem = async (cartItemId, token) => {
  const response = await fetch(buildApiUrl(`${CART_ITEM_BASE}/delete-cart-item/${cartItemId}`), {
    method: "DELETE",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to remove item from cart");
};

export const getCartItems = async (cartId, token) => {
  const response = await fetch(buildApiUrl(`${CART_ITEM_BASE}/get-cart-items/${cartId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to fetch cart items");
};

export const checkoutCart = async ({ successUrl, cancelUrl } = {}, token) => {
  if (!token) {
    throw new Error("You need to log in before checking out.");
  }
  const response = await fetch(buildApiUrl(`${CART_BASE}/checkout`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify({ successUrl, cancelUrl }),
  });
  return parseApiResponse(response, "Failed to create Stripe checkout session");
};

export const buyCart = async (token) => {
  const response = await fetch(buildApiUrl(`${CART_BASE}/buy`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });
  return parseApiResponse(response, "Failed to finalize cart purchase");
};
