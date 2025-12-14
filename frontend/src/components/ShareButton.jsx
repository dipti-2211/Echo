import React, { useState } from "react";
import { Share2, Check, Copy, X, Loader2 } from "lucide-react";
import axios from "axios";
import { auth } from "../firebaseConfig";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * ShareButton Component
 * Allows users to share a specific Q&A exchange and copy the URL to clipboard
 */
export default function ShareButton({
  question,
  answer,
  conversationId = null,
  className = "",
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Save the conversation to database and generate share URL
   */
  const handleShare = async () => {
    setIsSharing(true);
    setError(null);

    try {
      // Get Firebase auth token
      const user = auth.currentUser;
      if (!user) {
        setError("Please sign in to share conversations");
        setIsSharing(false);
        return;
      }

      const idToken = await user.getIdToken();

      // Call the share API
      const response = await axios.post(
        `${API_URL}/api/share`,
        {
          question,
          answer,
          conversationId,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setShareUrl(response.data.data.shareUrl);
        setShowModal(true);
      } else {
        setError(response.data.message || "Failed to create share link");
      }
    } catch (err) {
      console.error("Share error:", err);
      setError(err.response?.data?.message || "Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Copy the share URL to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Close the share modal
   */
  const closeModal = () => {
    setShowModal(false);
    setShareUrl("");
    setCopied(false);
    setError(null);
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-teal-400 hover:bg-teal-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Share this response"
      >
        {isSharing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600/20 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Share Link Created
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-4">
              Anyone with this link can view this conversation exchange.
            </p>

            {/* URL Input with Copy Button */}
            <div className="flex items-center gap-2 bg-[#2f2f2f] rounded-xl p-3 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-white text-sm outline-none truncate"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? "bg-teal-600 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
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
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-[#2f2f2f] rounded-xl p-4 max-h-48 overflow-y-auto custom-scroll">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <p className="text-sm text-white font-medium mb-2 line-clamp-2">
                Q:{" "}
                {question.length > 100
                  ? question.substring(0, 100) + "..."
                  : question}
              </p>
              <p className="text-sm text-gray-400 line-clamp-3">
                A:{" "}
                {answer.length > 150
                  ? answer.substring(0, 150) + "..."
                  : answer}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
