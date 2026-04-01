import { useEffect, useMemo, useState } from "react";
import { fetchChatUsers, fetchConversationMessages, fetchConversations, sendChatMessage } from "../../api/chat";
import { useAuth } from "../../context/AuthContext";
import "./ChatPage.css";

const CHAT_REFRESH_INTERVAL_MS = 5000;

const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString();
};

function ChatPage() {
  const { currentUser, token, isAuthenticated } = useAuth();
  const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPartner = useMemo(() => {
    const fromUsers = users.find((user) => user.userId === selectedPartnerId);
    if (fromUsers) return fromUsers;

    const fromConversations = conversations.find((conversation) => conversation.partnerId === selectedPartnerId);
    if (!fromConversations) return null;

    return {
      userId: fromConversations.partnerId,
      displayName: fromConversations.partnerName,
    };
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
        const initialPartner = chatConversations?.[0]?.partnerId || chatUsers?.[0]?.userId || "";
        setSelectedPartnerId(initialPartner);
      }
    } catch (loadError) {
      setError(loadError.message || "Unable to load chat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadInitialData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedPartnerId || !token) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const loadMessages = async () => {
      try {
        const conversationMessages = await fetchConversationMessages(selectedPartnerId, token);
        if (mounted) {
          setMessages(conversationMessages || []);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Unable to load conversation messages.");
        }
      }
    };

    loadMessages();
    const intervalId = window.setInterval(loadMessages, CHAT_REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [selectedPartnerId, token]);

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedPartnerId || !messageText.trim()) {
      return;
    }

    setError("");

    try {
      const created = await sendChatMessage(
        {
          recipientId: selectedPartnerId,
          content: messageText,
        },
        token
      );

      setMessages((previous) => {
        if (previous.some((message) => message.messageId === created.messageId)) {
          return previous;
        }
        return [...previous, created];
      });
      setMessageText("");
      setSelectedPartnerId(created.recipientId || selectedPartnerId);
      const refreshedConversations = await fetchConversations(token);
      setConversations(refreshedConversations || []);
    } catch (sendError) {
      setError(sendError.message || "Unable to send message.");
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <section className="chat-page">
        <h1>Chat</h1>
        <p>Please sign in to use direct messaging.</p>
      </section>
    );
  }

  return (
    <section className="chat-page">
      <header className="chat-header">
        <h1>Campus Chat</h1>
        <p>Message other students directly.</p>
      </header>

      {error ? <p className="chat-error">{error}</p> : null}

      <div className="chat-grid">
        <aside className="chat-sidebar">
          <h2>Conversations</h2>
          {loading ? <p>Loading conversations...</p> : null}
          <ul className="chat-list">
            {conversations.map((conversation) => (
              <li key={conversation.partnerId}>
                <button
                  type="button"
                  className={`chat-list-button ${selectedPartnerId === conversation.partnerId ? "active" : ""}`}
                  onClick={() => setSelectedPartnerId(conversation.partnerId)}
                >
                  <span>{conversation.partnerName}</span>
                  <small>{conversation.lastMessage}</small>
                </button>
              </li>
            ))}
          </ul>

          <h2>Start new</h2>
          <select
            value={selectedPartnerId}
            onChange={(event) => setSelectedPartnerId(event.target.value)}
            className="chat-user-select"
          >
            <option value="">Choose a student</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.displayName}
              </option>
            ))}
          </select>
        </aside>

        <div className="chat-thread">
          <h2>{selectedPartner ? `Chatting with ${selectedPartner.displayName}` : "Select a conversation"}</h2>

          <div className="chat-messages">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;
              return (
                <article key={message.messageId} className={`chat-message ${isMine ? "mine" : "theirs"}`}>
                  <p>{message.content}</p>
                  <small>{formatMessageTime(message.sentAt)}</small>
                </article>
              );
            })}
          </div>

          <form className="chat-compose" onSubmit={handleSendMessage}>
            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Type your message..."
              rows={3}
            />
            <button type="submit" disabled={!selectedPartnerId || !messageText.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ChatPage;
