import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import { useTypewriter } from "../hooks/useTypewriter";

export default function TypewriterText({
  content,
  speed = 8,
  chunkSize = 4,
  onTypingChange,
}) {
  const { displayedText, isTyping } = useTypewriter(content, speed, chunkSize);
  const containerRef = useRef(null);

  // Auto-scroll as text streams in
  useEffect(() => {
    if (isTyping && containerRef.current) {
      // Scroll the message container into view smoothly
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [displayedText, isTyping]);

  // Notify parent component of typing state changes
  useEffect(() => {
    if (onTypingChange) {
      onTypingChange(isTyping);
    }
  }, [isTyping, onTypingChange]);

  return (
    <div ref={containerRef} className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          p: ({ children }) => (
            <div className="mb-3 last:mb-0 text-gray-100 leading-relaxed">
              {children}
            </div>
          ),
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-4 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-100 leading-relaxed">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-teal-400 hover:text-teal-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-teal-500 pl-4 italic my-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>

      {/* Streaming cursor - solid block for high-speed effect */}
      {isTyping && (
        <span className="inline-block w-1.5 h-5 bg-teal-400 ml-0.5 animate-pulse align-middle">
          █
        </span>
      )}
    </div>
  );
}
