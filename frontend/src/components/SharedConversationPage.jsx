import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Bot,
  User,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import CodeBlock from "./CodeBlock";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * Parse message content and render code blocks
 */
function renderContent(content) {
  if (!content) return null;

  // Split by code blocks (```language\ncode```)
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(
          <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
            {textBefore}
          </span>
        );
      }
    }

    // Add code block
    const language = match[1] || "text";
    const code = match[2].trim();
    parts.push(
      <CodeBlock key={`code-${match.index}`} code={code} language={language} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    if (remainingText.trim()) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {remainingText}
        </span>
      );
    }
  }

  // If no code blocks found, return the content as-is
  if (parts.length === 0) {
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  return <>{parts}</>;
}

/**
 * SharedConversationPage Component
 * Displays a shared Q&A exchange in a clean, read-only layout
 */
export default function SharedConversationPage() {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch shared conversation data
  useEffect(() => {
    const fetchSharedConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/api/share/${shareId}`);

        if (response.data.success) {
          setData(response.data.data);

          // Update page title to the question
          document.title = `${response.data.data.question.substring(0, 60)}${
            response.data.data.question.length > 60 ? "..." : ""
          } - Echo`;
        } else {
          setError(
            response.data.message || "Failed to load shared conversation"
          );
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 404) {
          setError(
            "This shared conversation was not found or has been deleted."
          );
        } else if (err.response?.status === 410) {
          setError("This shared conversation has expired.");
        } else {
          setError(
            err.response?.data?.message || "Failed to load shared conversation"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedConversation();
    }

    // Reset title on unmount
    return () => {
      document.title = "Echo - AI Chat";
    };
  }, [shareId]);

  // Set body overflow when component mounts/unmounts
  useEffect(() => {
    // Allow scrolling on this page
    document.body.style.overflow = "auto";

    return () => {
      // Reset to hidden for main app
      document.body.style.overflow = "hidden";
    };
  }, []);

  // Copy current URL to clipboard
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-richBlack flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="mt-4 text-gray-400">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-richBlack flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <Share2 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Conversation Not Found
          </h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Echo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richBlack overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/10 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Go to Echo"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">Echo</h1>
              <p className="text-xs text-gray-500">Shared Conversation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyShareLink}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                copied
                  ? "bg-teal-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Try Echo</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {/* Shared Badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs font-medium">
            <Share2 className="w-3 h-3" />
            Shared Conversation
          </div>
          {data?.views > 0 && (
            <span className="text-xs text-gray-500">
              {data.views} view{data.views !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white text-richBlack flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-2">Question</p>
              <div className="text-white leading-relaxed">
                {renderContent(data?.question)}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8"></div>

        {/* Answer */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-2">Echo's Response</p>
              <div className="text-white leading-relaxed prose prose-invert max-w-none">
                {renderContent(data?.answer)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-6 mt-12">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">
              Shared on{" "}
              {data?.createdAt
                ? new Date(data.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Unknown date"}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white rounded-xl transition-all shadow-lg shadow-teal-500/30"
            >
              <Bot className="w-5 h-5" />
              Start your own conversation with Echo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
