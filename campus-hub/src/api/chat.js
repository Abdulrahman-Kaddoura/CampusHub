import { buildApiUrl, buildJsonHeaders, parseApiResponse } from "./client";

const BASE_PATH = "/chat";

export const fetchChatUsers = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/users`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load users");
};

export const fetchConversations = async (token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/conversations`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load conversations");
};

export const fetchConversationMessages = async (partnerId, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/messages/${partnerId}`), {
    method: "GET",
    headers: buildJsonHeaders(token),
    credentials: "include",
  });

  return parseApiResponse(response, "Failed to load messages");
};

export const sendChatMessage = async (payload, token) => {
  const response = await fetch(buildApiUrl(`${BASE_PATH}/messages`), {
    method: "POST",
    headers: buildJsonHeaders(token),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  return parseApiResponse(response, "Failed to send message");
};
