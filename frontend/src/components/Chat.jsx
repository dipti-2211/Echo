import React, { useState, useRef, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import axios from "axios";
import { Send, LogOut, Bot, User } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Chat({ user, activeChatId, onNewChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(activeChatId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Clean markdown formatting from AI responses
  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "$1") // Remove bold **text**
      .replace(/\*(.+?)\*/g, "$1") // Remove italic *text*
      .replace(/`(.+?)`/g, "$1") // Remove code `text`
      .replace(/^#+\s/gm, "") // Remove headers
      .replace(/^\*\s/gm, "• ") // Convert * lists to bullets
      .replace(/^-\s/gm, "• ") // Convert - lists to bullets
      .trim();
  };

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
    } else if (!activeChatId) {
      // New chat
      setMessages([]);
      setCurrentChatId(null);
    }
  }, [activeChatId]);

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

  const saveOrUpdateChat = async (userMessage, aiMessage) => {
    try {
      const newMessages = [...messages, userMessage, aiMessage];

      if (currentChatId) {
        // Update existing chat
        await updateDoc(doc(db, "chats", currentChatId), {
          messages: newMessages,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new chat
        const chatTitle =
          userMessage.content.slice(0, 50) +
          (userMessage.content.length > 50 ? "..." : "");
        const chatRef = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          title: chatTitle,
          messages: newMessages,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setCurrentChatId(chatRef.id);
      }
    } catch (error) {
      console.error("Error saving chat:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Send to backend
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { message: userMessage.content },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: cleanMarkdown(response.data.response), // Clean markdown
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Save to Firestore
        await saveOrUpdateChat(userMessage, aiMessage);
      } else {
        throw new Error(response.data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${
          error.response?.data?.message ||
          error.message ||
          "Failed to send message"
        }`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
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
      {/* Header - Simplified without logout */}
      <header className="glass border-b border-subtleGrey px-6 py-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">Echo</h1>
            <p className="text-sm text-mutedGrey">
              Where your thoughts echo through intelligence
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scroll px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
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
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 message-enter ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primaryWhite text-richBlack"
                      : message.isError
                      ? "bg-red-500/10 border border-red-500/50 text-red-400"
                      : "glass text-primaryWhite"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primaryWhite text-richBlack flex items-center justify-center flex-shrink-0 font-semibold">
                    {user.displayName?.charAt(0) ||
                      user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-4 message-enter">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/30">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-teal-400 typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-400 typing-dot"></div>
                  <div className="w-2 h-2 rounded-full bg-teal-400 typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-subtleGrey px-4 py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-darkZinc border border-subtleGrey rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primaryWhite/20 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Type your message..."
                disabled={loading}
                rows={1}
                className="w-full bg-transparent text-primaryWhite placeholder-teal-600/40 resize-none outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-primaryWhite text-richBlack rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
          <p className="text-xs text-mutedGrey text-center mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
