import React from "react";
import { LogOut, X } from "lucide-react";

/**
 * LogoutModal - Modern dark-themed confirmation modal
 * Replaces browser's default window.confirm() with a smooth animated modal
 */
export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Semi-transparent overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-md w-full transform animate-scaleIn"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Sign Out?</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Confirm you want to leave
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              Are you sure you want to sign out? Your chat history will be saved
              and available when you return.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6 pt-4 border-t border-gray-800">
            {/* Cancel Button */}
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Cancel
            </button>

            {/* Sign Out Button - Teal Theme */}
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
