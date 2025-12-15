import React, { useState, useRef, useEffect, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import axios from "axios";
import { Send, Bot, Edit3, Menu, PanelLeftOpen } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import TypewriterText from "./TypewriterText";
import ThinkingIndicator from "./ThinkingIndicator";
import PersonaSelector, { PERSONAS } from "./PersonaSelector";
import ShareButton from "./ShareButton";
import logger from "../utils/logger";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const MAX_INPUT_LENGTH = 10000; // Maximum characters allowed

export default function Chat({
  user,
  activeChatId,
  setActiveChatId,
  onNewChat,
  isSidebarOpen,
  toggleSidebar,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(activeChatId);
  const [selectedPersona, setSelectedPersona] = useState("default");
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [backendConversationId, setBackendConversationId] = useState(null); // Track backend conversation ID
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const personaTriggerRef = useRef(null);
  const chatIdRef = useRef(activeChatId); // Track chatId with ref to avoid stale closures
  const backendConversationIdRef = useRef(null); // Track backend conversation ID with ref

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Define loadChat BEFORE the useEffect that uses it
  const loadChat = useCallback(async (chatId) => {
    try {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setMessages(chatData.messages || []);
        setCurrentChatId(chatId);
        chatIdRef.current = chatId; // SYNC ref with state
      }
    } catch (error) {
      logger.error("Error loading chat:", error);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load chat when activeChatId changes
  useEffect(() => {
    if (activeChatId && activeChatId !== currentChatId) {
      loadChat(activeChatId);
      chatIdRef.current = activeChatId; // Update ref
      // Reset backend conversation ID when switching chats
      setBackendConversationId(null);
      backendConversationIdRef.current = null;
    } else if (!activeChatId && activeChatId !== currentChatId) {
      // New chat - reset everything
      setMessages([]);
      setCurrentChatId(null);
      chatIdRef.current = null; // Reset ref
      setInput("");
      // Reset backend conversation ID
      setBackendConversationId(null);
      backendConversationIdRef.current = null;
      // Auto-focus input for immediate typing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeChatId, currentChatId, loadChat]);

  // Cleanup: abort any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper function to save messages to existing chat
  const saveMessagesToChat = useCallback(
    async (chatId, userMessage, aiMessage) => {
      try {
        // Fetch current messages to avoid stale state
        const chatDoc = await getDoc(doc(db, "chats", chatId));
        const currentMessages = chatDoc.exists()
          ? chatDoc.data().messages || []
          : [];

        // Append new messages
        const updatedMessages = [...currentMessages, userMessage, aiMessage];

        await updateDoc(doc(db, "chats", chatId), {
          messages: updatedMessages,
          updatedAt: new Date(),
        });

        logger.log(`💾 Saved messages to chat: ${chatId}`);
      } catch (error) {
        logger.error("❌ Error saving messages:", error);
      }
    },
    []
  );

  const saveOrUpdateChat = async (
    userMessage,
    aiMessage,
    isNewChat = false
  ) => {
    try {
      const newMessages = [...messages, userMessage, aiMessage];

      if (currentChatId) {
        // Update existing chat
        await updateDoc(doc(db, "chats", currentChatId), {
          messages: newMessages,
          updatedAt: new Date(),
        });
      } else {
        // Create new chat with temporary title
        const tempTitle = "New Chat";
        const chatRef = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          title: tempTitle,
          messages: newMessages,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setCurrentChatId(chatRef.id);

        // Auto-rename after first exchange (only for new chats)
        if (isNewChat) {
          logger.log(`🚀 Triggering auto-rename for first exchange`);
          generateAndUpdateTitle(chatRef.id, userMessage.content);
        }
      }
    } catch (error) {
      logger.error("Error saving chat:", error);
    }
  };

  // Auto-rename function - runs in background
  const generateAndUpdateTitle = useCallback(
    async (chatId, firstMessage) => {
      try {
        logger.log(`🏷️ Generating title for chat ${chatId}...`);
        const idToken = await user.getIdToken();

        const response = await axios.post(
          `${API_URL}/api/generate-title`,
          { message: firstMessage },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        logger.log("📡 Title generation response:", response.data);

        if (response.data.success) {
          const newTitle = response.data.title;

          // Update Firestore with new title
          await updateDoc(doc(db, "chats", chatId), {
            title: newTitle,
            updatedAt: new Date(),
          });

          logger.log(`✅ Chat renamed to: "${newTitle}"`);
        }
      } catch (error) {
        logger.error("❌ Error generating title:", error);
        logger.error("Error details:", error.response?.data);
        // Silently fail - not critical to user experience
      }
    },
    [user]
  );

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      logger.log("🛑 Stopping generation...");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      logger.log("✅ Generation stopped");
    }
  }, []);

  const handleSend = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Guard: prevent multiple simultaneous submissions
      if (!input.trim() || loading) {
        logger.log("Blocked: empty input or already loading");
        return;
      }

      const messageToSend = input.trim();

      const userMessage = {
        id: Date.now(),
        role: "user",
        content: messageToSend,
        timestamp: new Date().toISOString(),
      };

      // Store previous messages BEFORE updating
      const previousMessages = [...messages];

      // Clear input and add user message IMMEDIATELY (optimistic UI)
      setInput("");
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        // Use ref for immediate access to current chat ID
        let chatId = chatIdRef.current;
        logger.log("📌 Current chatIdRef.current:", chatId);

        if (!chatId) {
          // Create NEW chat
          const newChatId = `chat_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          chatId = newChatId;

          // Update BOTH ref and state immediately
          chatIdRef.current = newChatId;
          setCurrentChatId(newChatId);

          if (setActiveChatId) {
            setActiveChatId(newChatId);
          }

          logger.log("🆕 Created new chat:", newChatId);

          // Save to Firestore (fire and forget)
          setDoc(doc(db, "chats", newChatId), {
            userId: user.uid,
            title:
              messageToSend.length > 50
                ? messageToSend.substring(0, 50) + "..."
                : messageToSend,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Generate title in background
          setTimeout(() => {
            generateAndUpdateTitle(newChatId, messageToSend).catch(() => {});
          }, 100);
        } else {
          logger.log("💬 Using existing chat:", chatId);
        }

        logger.log("🔑 Getting Firebase token...");
        // Get Firebase ID token and send to AI
        const idToken = await user.getIdToken();
        logger.log("✅ Token obtained");

        // Create AbortController for this request
        abortControllerRef.current = new AbortController();

        logger.log("🤖 Calling AI API at:", API_URL);
        logger.log("🎭 Using persona:", selectedPersona);
        logger.log(
          "📜 Sending conversation history:",
          previousMessages.length,
          "messages (excluding current user message)"
        );
        logger.log(
          "🔗 Backend conversationId:",
          backendConversationIdRef.current
        );

        const response = await axios.post(
          `${API_URL}/api/chat`,
          {
            userId: user.uid, // Include userId for backend
            message: messageToSend,
            conversationId: backendConversationIdRef.current, // Include conversationId to continue conversation
            conversationHistory: previousMessages.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            systemInstruction: PERSONAS[selectedPersona]?.prompt, // Add persona prompt
            temperature: PERSONAS[selectedPersona]?.temperature || 0.7, // Add persona-specific temperature
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
            signal: abortControllerRef.current.signal, // Add abort signal
          }
        );

        // Clear abort controller after successful response
        abortControllerRef.current = null;

        logger.log("✅ AI API responded with status:", response.status);
        logger.log("📦 Response data:", response.data);
        logger.log(
          "🔍 ConversationId in response:",
          response.data?.conversationId
        );
        logger.log("📊 Current messages count:", messages.length);

        if (response.data && response.data.success) {
          // Capture conversationId from backend response for follow-up messages
          const receivedConversationId = response.data.conversationId;
          logger.log("🔎 Received conversationId:", receivedConversationId);
          logger.log(
            "🔎 Current backendConversationIdRef:",
            backendConversationIdRef.current
          );

          if (receivedConversationId) {
            if (!backendConversationIdRef.current) {
              logger.log(
                "🆕 Setting NEW conversationId from backend:",
                receivedConversationId
              );
            } else {
              logger.log(
                "🔄 Updating conversationId from backend:",
                receivedConversationId
              );
            }
            setBackendConversationId(receivedConversationId);
            backendConversationIdRef.current = receivedConversationId;
            logger.log(
              "✅ conversationId stored, ref is now:",
              backendConversationIdRef.current
            );
          } else {
            logger.warn("⚠️ No conversationId in response!");
          }

          const aiMessage = {
            id: Date.now() + 1,
            role: "assistant",
            content: response.data.response,
            timestamp: new Date().toISOString(),
          };

          logger.log("💬 Adding AI message to UI...");
          setMessages((prev) => [...prev, aiMessage]);

          // Save both messages to Firestore - DON'T AWAIT (non-blocking)
          logger.log("💾 Saving to Firestore (background)...");
          saveMessagesToChat(chatId, userMessage, aiMessage)
            .then(() => logger.log("✅ Messages saved!"))
            .catch((err) => logger.warn("⚠️ Save failed (non-critical):", err));

          logger.log("✅ All done!");
        } else {
          logger.error("❌ AI response unsuccessful:", response.data);
          throw new Error(
            response.data?.message || "AI returned unsuccessful response"
          );
        }
      } catch (error) {
        // Check if request was aborted by user
        if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
          logger.log("🛑 Request cancelled by user");
          // Don't show error message for user-cancelled requests
          return;
        }

        logger.error("❌ Error in handleSend:", error);
        logger.error("Error response data:", error.response?.data);

        const errorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: `Error: ${
            error.response?.data?.message ||
            error.message ||
            "Failed to get AI response. Please try again."
          }`,
          timestamp: new Date().toISOString(),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        logger.log("🏁 Setting loading to false");
        setLoading(false);
      }
    },
    [
      input,
      loading,
      messages,
      selectedPersona,
      user,
      saveMessagesToChat,
      generateAndUpdateTitle,
    ]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error("Sign out error:", error);
    }
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-richBlack">
      {/* Header - Premium Glassmorphism */}
      <header className="glass sticky top-0 z-20 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-shrink-0 shadow-lg shadow-black/10">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Hamburger Menu - 44px touch target */}
          <button
            onClick={toggleSidebar}
            aria-label="Open navigation menu"
            className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            title="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </button>

          {/* Desktop Sidebar Toggle - Only show when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              aria-label="Open sidebar"
              className="hidden md:flex p-2.5 min-w-[44px] min-h-[44px] items-center justify-center hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              title="Open sidebar"
            >
              <PanelLeftOpen
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </button>
          )}

          {/* Logo with premium glow */}
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25 ring-1 ring-white/10">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-[15px] tracking-tight">Echo</h1>
            <p className="text-xs text-gray-500 hidden sm:block tracking-wide italic">
              Where your voice echoes through intelligence
            </p>
          </div>
        </div>

        {/* Persona Selector - Premium button */}
        <div className="relative">
          <button
            ref={personaTriggerRef}
            onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
            aria-label="Change AI mode"
            aria-expanded={showPersonaDropdown}
            aria-haspopup="menu"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/20 hover:border-teal-500/30 transition-all duration-200 active:scale-95 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            title="Change AI Mode"
          >
            <Edit3 className="w-4 h-4 text-teal-400" aria-hidden="true" />
          </button>

          {/* Persona Dropdown Menu */}
          <PersonaSelector
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
            isOpen={showPersonaDropdown}
            onClose={() => setShowPersonaDropdown(false)}
            triggerRef={personaTriggerRef}
          />
        </div>
      </header>

      {/* Messages Area - Clean background with scroll chaining prevention */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll bg-gradient-to-b from-richBlack to-[#0a0a0a]"
        style={{ overscrollBehavior: "contain" }}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8 md:py-20 animate-fade-in px-3 md:px-4">
            {/* Premium Logo */}
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 mb-4 md:mb-6 shadow-2xl shadow-teal-500/20 ring-1 ring-white/10">
              <Bot className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
            <h2 className="text-xl md:text-3xl font-semibold mb-2 md:mb-3 tracking-tight">
              Welcome to Echo
            </h2>
            <p className="text-gray-500 mb-6 md:mb-10 text-xs md:text-base max-w-md mx-auto leading-relaxed italic">
              Where your voice echoes through intelligence
            </p>

            {/* Starter Prompts - Compact on mobile */}
            <div className="grid grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto">
              {[
                "What can you help me with?",
                "Explain quantum computing",
                "Write a short story",
                "Give me productivity tips",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="glass-card px-3 md:px-4 py-3 md:py-4 min-h-[44px] md:min-h-[56px] rounded-lg md:rounded-xl text-left hover:bg-white/5 hover:border-white/10 transition-all duration-300 active:scale-[0.98] group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                >
                  <p className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors leading-relaxed break-words">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col py-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`w-full py-5 md:py-6 ${
                  message.role === "user" ? "bg-white/[0.02]" : ""
                }`}
              >
                <div className="max-w-3xl mx-auto px-4 md:px-6 flex gap-4">
                  {/* Avatar - Premium styling */}
                  {message.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20 ring-1 ring-white/10">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 text-white flex items-center justify-center flex-shrink-0 font-medium text-sm ring-1 ring-white/10">
                      {user?.displayName?.charAt(0) ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                  )}

                  {/* Message Content - Premium typography with word break */}
                  <div className="flex-1 min-w-0 overflow-x-hidden">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 font-medium">
                      {message.role === "assistant" ? "Echo" : "You"}
                    </p>
                    {message.role === "assistant" ? (
                      <div className="break-words overflow-wrap-anywhere">
                        <TypewriterText
                          content={message.content}
                          speed={8}
                          chunkSize={4}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-200 whitespace-pre-wrap leading-[1.75] text-[15px] break-words overflow-wrap-anywhere">
                        {message.content}
                      </p>
                    )}

                    {/* Timestamp and Actions - Subtle styling */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <p className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>

                      {/* Share Button - Only show for AI responses */}
                      {message.role === "assistant" && !message.isError && (
                        <ShareButton
                          question={(() => {
                            // Find the user message immediately before this AI response
                            const msgIndex = messages.findIndex(
                              (m) => m.id === message.id
                            );
                            if (msgIndex > 0) {
                              const prevMsg = messages[msgIndex - 1];
                              if (prevMsg.role === "user") {
                                return prevMsg.content;
                              }
                            }
                            return "User question";
                          })()}
                          answer={message.content}
                          conversationId={currentChatId}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking Indicator - Modern bouncing dots animation */}
            {loading && (
              <div className="w-full py-8">
                <div className="max-w-3xl mx-auto px-4">
                  <ThinkingIndicator />
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Premium floating style */}
      <div className="flex-shrink-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-2">
        <div
          className="max-w-3xl mx-auto px-3 md:px-4 pb-4 md:pb-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <form onSubmit={handleSend} className="relative">
            {/* Input Container - Premium glass effect */}
            <div className="input-glass rounded-2xl md:rounded-[22px] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)] focus-within:ring-1 focus-within:ring-teal-500/30 focus-within:shadow-teal-500/5">
              <div className="flex items-end gap-2 md:gap-3 p-3 md:p-4 pl-5 md:pl-6">
                {/* Auto-resize Textarea - Premium typography */}
                <div className="flex-1 relative">
                  <TextareaAutosize
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= MAX_INPUT_LENGTH) {
                        setInput(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Message Echo..."
                    disabled={loading}
                    minRows={1}
                    maxRows={8}
                    maxLength={MAX_INPUT_LENGTH}
                    className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none py-2 leading-relaxed disabled:opacity-50 max-h-[200px] md:max-h-[300px] overflow-y-auto custom-scroll"
                    style={{
                      fontSize: "16px",
                      lineHeight: "26px",
                      letterSpacing: "-0.01em",
                    }}
                  />
                  {/* Character counter - shows when approaching limit */}
                  {input.length > MAX_INPUT_LENGTH * 0.8 && (
                    <div
                      className={`absolute -top-6 right-0 text-xs ${
                        input.length >= MAX_INPUT_LENGTH
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {input.length.toLocaleString()}/
                      {MAX_INPUT_LENGTH.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Send/Stop Button - Premium styling with focus ring */}
                {loading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="flex-shrink-0 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white text-black hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2f2f2f]"
                    title="Stop generating"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`flex-shrink-0 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2f2f2f] ${
                      input.trim()
                        ? "bg-white text-black hover:bg-gray-100 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 active:scale-95"
                        : "bg-white/10 text-gray-600 cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Helper Text - Premium subtle styling */}
            <div className="hidden sm:block text-center mt-3 text-[11px] text-gray-600 tracking-wide">
              <span>Press Enter to send · Shift + Enter for new line</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
