import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Mail, X, Check, AlertCircle } from "lucide-react";

/**
 * ResetPasswordModal - Modal for password reset via email
 */
export default function ResetPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("success");
      setMessage("Password reset email sent! Check your inbox.");
      setEmail(""); // Clear email field

      // Auto-close after 3 seconds on success
      setTimeout(() => {
        onClose();
        setStatus(null);
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);
      setStatus("error");

      // User-friendly error messages
      if (err.code === "auth/user-not-found") {
        setMessage("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setMessage("Invalid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setMessage("Too many requests. Please try again later.");
      } else {
        setMessage(err.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail("");
      setStatus(null);
      setMessage("");
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Reset Password
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  We'll send you a reset link
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleResetPassword} className="px-6 pb-6">
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Status Message */}
            {status && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  status === "success"
                    ? "bg-teal-500/10 border border-teal-500/50 text-teal-400"
                    : "bg-red-500/10 border border-red-500/50 text-red-400"
                }`}
              >
                {status === "success" ? (
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <span className="text-sm">{message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-medium transition-all duration-200 disabled:opacity-50 shadow-lg shadow-teal-500/30"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
