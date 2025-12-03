import React from "react";

/**
 * ThinkingIndicator - Displays animated bouncing dots while the bot is processing
 * Similar to iMessage/ChatGPT style
 */
export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-6 animate-fadeIn">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg">
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
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>

      {/* Thinking Dots Container */}
      <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl rounded-tl-none px-6 py-4 shadow-xl">
        <div className="flex items-center gap-1.5">
          {/* Dot 1 */}
          <div
            className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce-dot"
            style={{ animationDelay: "0ms" }}
          ></div>

          {/* Dot 2 */}
          <div
            className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce-dot"
            style={{ animationDelay: "150ms" }}
          ></div>

          {/* Dot 3 */}
          <div
            className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce-dot"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
