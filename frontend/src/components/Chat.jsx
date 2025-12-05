import React, { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import axios from "axios";
import {
  Send,
  LogOut,
  Bot,
  User,
  Edit3,
  Menu,
  PanelLeftOpen,
  Plus,
  Paperclip,
} from "lucide-react";
import CodeBlock from "./CodeBlock";
import TextareaAutosize from "react-textarea-autosize";
import TypewriterText from "./TypewriterText";
import ThinkingIndicator from "./ThinkingIndicator";
import PersonaSelector, { PERSONAS } from "./PersonaSelector";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Chat({
  user,
  activeChatId,
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const personaTriggerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Test Firestore write capability on mount
  useEffect(() => {
    const testFirestoreWrite = async () => {
      if (!user) return;

      try {
        console.log("🧪 Testing Firestore write capability...");
        const testRef = doc(db, "test", "testDoc");
        await setDoc(testRef, {
          test: "hello",
          timestamp: new Date(),
          userId: user.uid,
        });
        console.log("✅ Firestore write test PASSED - writes are working!");
      } catch (error) {
        console.error("❌ Firestore write test FAILED:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        if (error.code === "permission-denied") {
          console.error(
            "🔥 PERMISSION DENIED - Check your Firestore security rules!"
          );
          console.error("Go to Firebase Console > Firestore Database > Rules");
        }
      }
    };

    if (user) {
      testFirestoreWrite();
    }
  }, [user]);

  // Load chat when activeChatId changes
  useEffect(() => {
    if (activeChatId && activeChatId !== currentChatId) {
      loadChat(activeChatId);
    } else if (!activeChatId && activeChatId !== currentChatId) {
      // New chat - reset everything
      setMessages([]);
      setCurrentChatId(null);
      setInput("");
      // Auto-focus input for immediate typing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeChatId]);

  // Cleanup: abort any ongoing requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadChat = async (chatId) => {
    try {
      const chatDoc = await getDoc(doc(db, "chats", chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setMessages(chatData.messages || []);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  // Helper function to save messages to existing chat
  const saveMessagesToChat = async (chatId, userMessage, aiMessage) => {
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

      console.log(`💾 Saved messages to chat: ${chatId}`);
    } catch (error) {
      console.error("❌ Error saving messages:", error);
    }
  };

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
          console.log(`🚀 Triggering auto-rename for first exchange`);
          generateAndUpdateTitle(chatRef.id, userMessage.content);
        }
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  // Auto-rename function - runs in background
  const generateAndUpdateTitle = async (chatId, firstMessage) => {
    try {
      console.log(`🏷️ Generating title for chat ${chatId}...`);
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

      console.log("📡 Title generation response:", response.data);

      if (response.data.success) {
        const newTitle = response.data.title;

        // Update Firestore with new title
        await updateDoc(doc(db, "chats", chatId), {
          title: newTitle,
          updatedAt: new Date(),
        });

        console.log(`✅ Chat renamed to: "${newTitle}"`);
      }
    } catch (error) {
      console.error("❌ Error generating title:", error);
      console.error("Error details:", error.response?.data);
      // Silently fail - not critical to user experience
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      console.log("🛑 Stopping generation...");
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      console.log("✅ Generation stopped");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Guard: prevent multiple simultaneous submissions
    if (!input.trim() || loading) {
      console.log("Blocked: empty input or already loading");
      return;
    }

    const messageToSend = input.trim();

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    // Clear input and set loading IMMEDIATELY
    setInput("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // CRITICAL: Check currentChatId ONLY (not messages.length)
      let chatId = currentChatId;

      if (!chatId) {
        // This is a NEW chat - create it FIRST
        console.log(
          "🆕 Creating new chat with title:",
          messageToSend.substring(0, 50)
        );

        try {
          console.log("📝 Creating new chat document...");

          // Generate a unique ID manually
          const newChatId = `chat_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          chatId = newChatId;
          setCurrentChatId(newChatId);

          console.log("💾 Saving to Firestore (background):", {
            docId: newChatId,
            userId: user.uid,
            title:
              messageToSend.length > 50
                ? messageToSend.substring(0, 50) + "..."
                : messageToSend,
          });

          // Save to Firestore - don't wait for Promise, it will sync eventually
          setDoc(doc(db, "chats", newChatId), {
            userId: user.uid,
            title:
              messageToSend.length > 50
                ? messageToSend.substring(0, 50) + "..."
                : messageToSend,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }); // No .then() or .catch() - just fire and forget

          console.log("📤 Chat save initiated (will sync in background)");

          console.log("✅ New chat created with ID:", chatId);
        } catch (firestoreError) {
          console.error("❌ Firestore addDoc failed:", firestoreError);
          throw new Error("Failed to create chat: " + firestoreError.message);
        }

        // Generate better title in background (don't await, use setTimeout to ensure non-blocking)
        setTimeout(() => {
          generateAndUpdateTitle(chatId, messageToSend).catch((err) => {
            console.warn(
              "⚠️ Title generation failed (non-critical):",
              err.message
            );
          });
        }, 0);

        console.log("📝 Title generation queued, continuing...");
      } else {
        console.log("💬 Using existing chat:", chatId);
      }

      console.log("🔑 Getting Firebase token...");
      // Get Firebase ID token and send to AI
      const idToken = await user.getIdToken();
      console.log("✅ Token obtained");

      // Create AbortController for this request
      abortControllerRef.current = new AbortController();

      console.log("🤖 Calling AI API at:", API_URL);
      console.log("🎭 Using persona:", selectedPersona);

      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: messageToSend,
          systemInstruction: PERSONAS[selectedPersona]?.prompt, // Add persona prompt
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

      console.log("✅ AI API responded with status:", response.status);
      console.log("📦 Response data:", response.data);
      console.log("📊 Current messages count:", messages.length);

      if (response.data && response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.data.response,
          timestamp: new Date().toISOString(),
        };

        console.log("💬 Adding AI message to UI...");
        setMessages((prev) => [...prev, aiMessage]);

        // Save both messages to Firestore - DON'T AWAIT (non-blocking)
        console.log("💾 Saving to Firestore (background)...");
        saveMessagesToChat(chatId, userMessage, aiMessage)
          .then(() => console.log("✅ Messages saved!"))
          .catch((err) => console.warn("⚠️ Save failed (non-critical):", err));

        console.log("✅ All done!");
      } else {
        console.error("❌ AI response unsuccessful:", response.data);
        throw new Error(
          response.data?.message || "AI returned unsuccessful response"
        );
      }
    } catch (error) {
      // Check if request was aborted by user
      if (error.code === "ERR_CANCELED" || error.name === "CanceledError") {
        console.log("🛑 Request cancelled by user");
        // Don't show error message for user-cancelled requests
        return;
      }

      console.error("❌ Error in handleSend:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error stack:", error.stack);

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
      console.log("🏁 Setting loading to false");
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Mobile Hamburger and Desktop Toggle */}
      <header className="glass border-b border-subtleGrey px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Open menu"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Desktop Sidebar Toggle - Only show when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Open sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-white" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">Echo</h1>
            <p className="text-sm text-mutedGrey hidden sm:block">
              Where your thoughts echo through intelligence
            </p>
          </div>
        </div>

        {/* Persona Selector Trigger (Pencil Icon) */}
        <div className="relative">
          <button
            ref={personaTriggerRef}
            onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
            className="p-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 transition-colors relative"
            title="Change AI Mode"
          >
            <Edit3 className="w-5 h-5 text-teal-400" />
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {messages.length === 0 ? (
          <div className="text-center py-12 animate-fade-in px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 mb-6 shadow-xl shadow-teal-500/30">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Echo</h2>
            <p className="text-mutedGrey mb-8">
              Where your thoughts echo through intelligence
            </p>

            {/* Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "What can you help me with?",
                "Explain quantum computing",
                "Write a short story",
                "Give me productivity tips",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="glass px-4 py-3 rounded-xl text-left hover:bg-teal-900/20 hover:border-teal-500/30 transition-all duration-300"
                >
                  <p className="text-sm">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((message) => (
              <div key={message.id} className="w-full py-8">
                <div className="max-w-3xl mx-auto px-4 flex gap-4">
                  {/* Avatar */}
                  {message.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/30">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primaryWhite text-richBlack flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                      {user?.displayName?.charAt(0) ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {message.role === "assistant" ? (
                      <TypewriterText
                        content={message.content}
                        speed={8}
                        chunkSize={4}
                      />
                    ) : (
                      <p className="text-primaryWhite whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
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

      {/* Input Area - ChatGPT Style Floating Island */}
      <div className="border-t border-white/5 bg-gradient-to-t from-[#171717] to-transparent">
        <div className="max-w-3xl mx-auto px-4 pb-6 pt-4">
          <form onSubmit={handleSend} className="relative">
            {/* Input Container */}
            <div className="bg-[#2f2f2f] rounded-[26px] shadow-xl border border-white/10 overflow-hidden">
              <div className="flex items-end gap-2 p-3">
                {/* Paperclip Icon Button - No Function */}
                <button
                  type="button"
                  disabled
                  className="flex-shrink-0 p-2.5 text-gray-400 opacity-50 cursor-not-allowed"
                  title="Attachments (Coming soon)"
                >
                  <Paperclip className="w-6 h-6" />
                </button>

                {/* Auto-resize Textarea */}
                <TextareaAutosize
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
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
                  className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none py-2 disabled:opacity-50 max-h-[200px] overflow-y-auto custom-scroll"
                />

                {/* Send/Stop Button */}
                {loading ? (
                  /* Stop Generation Button */
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="flex-shrink-0 p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-all"
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
                  /* Send Button */
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                      input.trim()
                        ? "bg-white text-black hover:bg-gray-200"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Footer Disclaimer */}
          <p className="text-xs text-gray-500 text-center mt-3">
            Echo can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
