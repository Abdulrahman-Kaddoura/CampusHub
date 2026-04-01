import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/api/chat";
const FALLBACK_BASE_PATH = "/chat";

const sendChatRequest = async (path, options) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}${path}`), options);

  if (response.status !== 404) {
    return response;
  }

  return fetch(buildApiUrl(`${FALLBACK_BASE_PATH}${path}`), options);
};

export const fetchChatUsers = async (token) => {
  const response = await sendChatRequest("/users", {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load users");
};

export const fetchConversations = async (token) => {
  const response = await sendChatRequest("/conversations", {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load conversations");
};

export const fetchConversationMessages = async (partnerId, token) => {
  const response = await sendChatRequest(`/messages/${partnerId}`, {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load messages");
};

export const sendChatMessage = async (payload, token) => {
  const response = await sendChatRequest("/messages", {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to send message");
};
