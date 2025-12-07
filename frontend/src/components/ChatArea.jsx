import React, { useEffect, useRef, useState } from 'react'
import { MessageSquare } from 'lucide-react'

function formatTime(d = new Date()) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatArea({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    // scroll to bottom on messages change
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { id: Date.now() + '_u', sender: 'user', text: input.trim(), time: formatTime() }
    setMessages((m) => [...m, userMsg])
    setInput('')

    // simulate streaming AI reply
    setIsTyping(true)
    const reply = simulateAIReply(input.trim())
    streamAIReply(reply)
  }

  const simulateAIReply = (prompt) => {
    // simple deterministic reply for demo
    return `Echo: ${prompt}.\n\nThis is a simulated response rendered with a typing/stream effect.`
  }

  const streamAIReply = (fullText) => {
    let i = 0
    const chunkInterval = 20
    const chunker = setInterval(() => {
      i++
      const partial = fullText.slice(0, i)
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.sender === 'ai' && last.id === 'stream') {
          // replace streaming message
          return [...prev.slice(0, prev.length - 1), { ...last, text: partial }]
        }
        return [...prev, { id: 'stream', sender: 'ai', text: partial, time: formatTime() }]
      })

      if (i >= fullText.length) {
        clearInterval(chunker)
        // finalize streaming message id
        setMessages((prev) => prev.map((m) => (m.id === 'stream' ? { ...m, id: Date.now() + '_ai' } : m)))
        setIsTyping(false)
      }
    }, chunkInterval)
  }

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="mb-6">
        {/* ChatGPT-like logo */}
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" className="mx-auto">
          <rect width="24" height="24" rx="6" fill="#2F2F2F" />
          <path d="M7 8h10v8H7z" stroke="#ECECF1" strokeWidth="1" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">Welcome to Chat</h3>
      <p className="text-greyText mt-2 max-w-xl">Try one of the starter prompts below or start a new conversation.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
        {['Explain quantum computing', 'Write a marketing plan', 'Refactor this React code'].map((s) => (
          <button key={s} className="bg-[#2b2b2b] px-4 py-3 rounded-md text-left hover:bg-[#343434]" onClick={() => { setInput(s); }}>
            <div className="text-sm">{s}</div>
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col relative">
      <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-6 chat-scroll">
        {messages.length === 0 ? <EmptyState /> : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'ai' && (
                  <div className="mr-3 w-8 h-8 rounded-full bg-[#3b3b3b] flex items-center justify-center">
                    <MessageSquare size={16} />
                  </div>
                )}
                <div className={`${m.sender === 'user' ? 'bg-white text-black' : 'bg-[#2b2b2b] text-primaryText'} rounded-2xl px-4 py-3 max-w-[70%]`}>{m.text}
                  <div className="text-xs text-greyText mt-2 text-right">{m.time}</div>
                </div>
                {m.sender === 'user' && <div className="ml-3 w-8 h-8 rounded-full bg-[#111]" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed input at bottom */}
      <div className="w-full bg-transparent py-6">
        <div className="mx-auto max-w-3xl px-4">
          <form onSubmit={sendMessage} className="flex items-center gap-3 bg-input rounded-2xl px-4 py-3">
            <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={1} placeholder="Send a message..." className="flex-1 resize-none bg-transparent outline-none text-primaryText" />
            <button type="submit" disabled={!input.trim()} className="ml-2 bg-white text-black px-4 py-2 rounded-md">Send</button>
          </form>
        </div>
      </div>
    </div>
  )
}
import React, { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:5001/api";

const ChatArea = ({ userId, token }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          message: messageText,
          conversationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update conversation ID if this is a new conversation
        if (!conversationId && data.conversationId) {
          setConversationId(data.conversationId);
        }

        const aiMessage = {
          id: messages.length + 2,
          type: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Show error message
        const errorMessage = {
          id: messages.length + 2,
          type: "ai",
          text: `Error: ${data.message || "Failed to get response"}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "ai",
        text: "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] ${
                message.type === "user"
                  ? "bg-white text-deep-grey-dark"
                  : "bg-deep-grey-light border border-grey-border text-white"
              } rounded-2xl px-5 py-3 shadow-lg`}
            >
              <div className="flex items-start gap-3">
                {message.type === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-grey-text flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-deep-grey-dark"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.type === "user"
                        ? "text-deep-grey-dark/60"
                        : "text-grey-text"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                {message.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-deep-grey-dark to-deep-grey-light flex items-center justify-center flex-shrink-0 mt-1">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-grey-border bg-deep-grey-light px-6 py-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-5 py-3 bg-deep-grey-dark border border-grey-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-grey-text transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-6 py-3 bg-white text-deep-grey-dark rounded-xl font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <span>{loading ? "Sending..." : "Send"}</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </form>
        <p className="text-xs text-grey-text text-center mt-3">
          AI responses may not always be accurate. Please verify important
          information.
        </p>
      </div>
    </div>
  );
};


