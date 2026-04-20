import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchChatUsers, fetchConversationMessages, fetchConversations, sendChatMessage } from "../../api/chat";
import Avatar from "../../components/Avatar/Avatar";
import LocationPickerModal from "../../components/LocationPicker/LocationPickerModal";
import LocationMessage from "../../components/LocationMessage/LocationMessage";
import { useAuth } from "../../context/AuthContext";
import "./ChatPage.css";

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const isYesterday =
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday, ${timeStr}`;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${timeStr}`;
};

const formatConversationTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

function ChatPage() {
  const { currentUser, token, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState(searchParams.get("partner") || "");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesPollRef = useRef(null);
  const conversationsPollRef = useRef(null);
  const textareaRef = useRef(null);

  const selectedPartner = useMemo(() => {
    const fromUsers = users.find((u) => u.userId === selectedPartnerId);
    if (fromUsers) return fromUsers;
    const fromConversations = conversations.find((c) => c.partnerId === selectedPartnerId);
    if (!fromConversations) return null;
    return { userId: fromConversations.partnerId, displayName: fromConversations.partnerName };
  }, [users, conversations, selectedPartnerId]);

  const loadInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const [chatUsers, chatConversations] = await Promise.all([
        fetchChatUsers(token),
        fetchConversations(token),
      ]);
      setUsers(chatUsers || []);
      setConversations(chatConversations || []);
      if (!selectedPartnerId) {
        const initial = chatConversations?.[0]?.partnerId || chatUsers?.[0]?.userId || "";
        setSelectedPartnerId(initial);
      }
    } catch (err) {
      setError(err.message || "Unable to load chat data.");
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = useCallback(() => {
    if (!selectedPartnerId || !token) return;
    fetchConversationMessages(selectedPartnerId, token)
      .then((msgs) => {
        if (!msgs) return;
        setMessages((prev) => (msgs.length === prev.length ? prev : msgs));
      })
      .catch(() => {});
  }, [selectedPartnerId, token]);

  const pollConversations = useCallback(() => {
    if (!token) return;
    fetchConversations(token)
      .then((convs) => {
        if (!convs) return;
        setConversations((prev) => (convs.length === prev.length ? prev : convs));
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    loadInitialData();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (messagesPollRef.current) {
      clearInterval(messagesPollRef.current);
      messagesPollRef.current = null;
    }
    if (!selectedPartnerId) {
      setMessages([]);
      return;
    }
    let mounted = true;
    fetchConversationMessages(selectedPartnerId, token)
      .then((msgs) => { if (mounted) setMessages(msgs || []); })
      .catch((err) => { if (mounted) setError(err.message || "Unable to load messages."); });
    messagesPollRef.current = setInterval(pollMessages, 3000);
    return () => {
      mounted = false;
      clearInterval(messagesPollRef.current);
      messagesPollRef.current = null;
    };
  }, [selectedPartnerId, token, pollMessages]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    conversationsPollRef.current = setInterval(pollConversations, 10000);
    return () => {
      clearInterval(conversationsPollRef.current);
      conversationsPollRef.current = null;
    };
  }, [isAuthenticated, token, pollConversations]);

  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedPartnerId || !messageText.trim()) return;
    setError("");
    try {
      const created = await sendChatMessage({ recipientId: selectedPartnerId, content: messageText }, token);
      setMessages((prev) => [...prev, created]);
      setMessageText("");
      textareaRef.current?.focus();
      const refreshed = await fetchConversations(token);
      setConversations(refreshed || []);
    } catch (err) {
      setError(err.message || "Unable to send message.");
    }
  };

  const handleSendLocation = async (location) => {
    setLocationPickerOpen(false);
    if (!selectedPartnerId) return;
    setError("");
    try {
      const created = await sendChatMessage({
        recipientId: selectedPartnerId,
        messageType: "LOCATION",
        latitude: location.lat,
        longitude: location.lng,
      }, token);
      setMessages((prev) => [...prev, created]);
      const refreshed = await fetchConversations(token);
      setConversations(refreshed || []);
    } catch (err) {
      setError(err.message || "Unable to send location.");
    }
  };

  const handleSelectConversation = (partnerId) => {
    setSelectedPartnerId(partnerId);
    setNewChatOpen(false);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <section className="chat-page">
        <h1>Chat</h1>
        <p>Please sign in to use direct messaging.</p>
      </section>
    );
  }

  // Users that don't already have a conversation
  const usersWithoutConversation = users.filter(
    (u) => !conversations.some((c) => c.partnerId === u.userId)
  );

  return (
    <section className="chat-page">
      {locationPickerOpen && (
        <LocationPickerModal
          onConfirm={handleSendLocation}
          onCancel={() => setLocationPickerOpen(false)}
        />
      )}

      <div className="chat-grid">
        {/* ── Sidebar ── */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h2>Messages</h2>
            <button
              type="button"
              className="new-chat-btn"
              onClick={() => setNewChatOpen((o) => !o)}
              title="Start new conversation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {newChatOpen && (
            <div className="new-chat-panel">
              <p className="new-chat-label">Start a new conversation</p>
              <select
                className="chat-user-select"
                value=""
                onChange={(e) => {
                  if (e.target.value) handleSelectConversation(e.target.value);
                }}
              >
                <option value="">Choose a student...</option>
                {usersWithoutConversation.map((u) => (
                  <option key={u.userId} value={u.userId}>{u.displayName}</option>
                ))}
                {usersWithoutConversation.length === 0 && (
                  <option disabled>You have conversations with everyone</option>
                )}
              </select>
            </div>
          )}

          {loading && <p className="chat-loading">Loading...</p>}

          <ul className="chat-list">
            {conversations.map((conv) => (
              <li key={conv.partnerId}>
                <button
                  type="button"
                  className={`chat-list-item ${selectedPartnerId === conv.partnerId ? "active" : ""}`}
                  onClick={() => handleSelectConversation(conv.partnerId)}
                >
                  <Avatar userId={conv.partnerId} name={conv.partnerName} size="sm" />
                  <div className="chat-list-item-body">
                    <span className="chat-list-item-name">{conv.partnerName}</span>
                    <span className="chat-list-item-preview">{conv.lastMessage}</span>
                  </div>
                  {conv.lastMessageAt && (
                    <span className="chat-list-item-time">{formatConversationTime(conv.lastMessageAt)}</span>
                  )}
                </button>
              </li>
            ))}
            {!loading && conversations.length === 0 && (
              <li className="chat-empty-state">
                No conversations yet. Start one above!
              </li>
            )}
          </ul>
        </aside>

        {/* ── Thread ── */}
        <div className="chat-thread">
          {selectedPartner ? (
            <>
              <div className="chat-thread-header">
                <Avatar userId={selectedPartner.userId} name={selectedPartner.displayName} size="sm" />
                <div className="chat-thread-header-info">
                  <span className="chat-thread-name">{selectedPartner.displayName}</span>
                  <span className="chat-thread-status">AUB Student</span>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 && (
                  <p className="chat-no-messages">
                    Say hello to {selectedPartner.displayName}!
                  </p>
                )}
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === currentUser.id;
                  const prevMsg = messages[idx - 1];
                  const showSenderInfo = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId);
                  const isLocation = msg.messageType === "LOCATION";
                  return (
                    <div key={msg.messageId} className={`chat-message-row ${isMine ? "mine" : "theirs"}`}>
                      {!isMine && (
                        <div className="chat-message-avatar">
                          {showSenderInfo ? (
                            <Avatar userId={msg.senderId} name={msg.senderName} size="xs" />
                          ) : (
                            <div className="chat-avatar-spacer" />
                          )}
                        </div>
                      )}
                      <div className="chat-message-content">
                        {showSenderInfo && (
                          <span className="chat-message-sender">{msg.senderName}</span>
                        )}
                        {isLocation ? (
                          <LocationMessage
                            latitude={msg.latitude}
                            longitude={msg.longitude}
                            isMine={isMine}
                          />
                        ) : (
                          <div className={`chat-bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
                            <p>{msg.content}</p>
                          </div>
                        )}
                        <span className="chat-message-time">{formatMessageTime(msg.sentAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {error && <p className="chat-error">{error}</p>}

              <form className="chat-compose" onSubmit={handleSendMessage}>
                <button
                  type="button"
                  className="chat-location-btn"
                  onClick={() => setLocationPickerOpen(true)}
                  title="Share location"
                  aria-label="Share location"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={!messageText.trim()}
                  aria-label="Send message"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-thread">
              <div className="chat-empty-thread-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c0c8d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p>Select a conversation or start a new one.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ChatPage;
