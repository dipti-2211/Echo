import React from 'react'
import { LogOut, Plus, Settings } from 'lucide-react'
import { signOut } from '../firebase'
import { auth } from '../firebase'

export default function Sidebar({ user }) {
  const history = [
    'Previous Code Help',
    'Marketing Plan',
    'React Component Design',
  ]

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-[#0f0f0f] rounded-md">
          <Plus size={16} />
          <span className="text-sm">New chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 chat-scroll">
        <ul className="space-y-2">
          {history.map((h, idx) => (
            <li key={idx} className="p-3 rounded-md hover:bg-[#1a1a1a] cursor-pointer text-greyText">{h}</li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-black font-bold">{user.name?.charAt(0)}</div>
            <div>
              <div className="text-sm">{user.name}</div>
              <div className="text-xs text-greyText">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSignOut} className="p-2 rounded-md hover:bg-[#1a1a1a]">
              <LogOut size={16} />
            </button>
            <button className="p-2 rounded-md hover:bg-[#1a1a1a]">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
import React from "react";

const Sidebar = ({ isOpen, onToggle, userName }) => {
  const chatHistory = [
    { id: 1, title: "Previous Code Help", time: "2 hours ago" },
    { id: 2, title: "Marketing Plan", time: "Yesterday" },
    { id: 3, title: "React Component Design", time: "3 days ago" },
    { id: 4, title: "API Integration Guide", time: "1 week ago" },
    { id: 5, title: "Database Schema", time: "2 weeks ago" },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-deep-grey-light border-r border-grey-border transition-all duration-300 z-20 ${
          isOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-grey-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Chat History</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-deep-grey-dark rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-grey-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 border-b border-grey-border">
            <button className="w-full px-4 py-3 bg-white text-deep-grey-dark rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-deep-grey-dark transition-colors group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-white">
                      {chat.title}
                    </p>
                    <p className="text-grey-text text-xs mt-1">{chat.time}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-grey-text opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* User Info at Bottom */}
          <div className="p-4 border-t border-grey-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-grey-text rounded-full flex items-center justify-center text-deep-grey-dark font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {userName}
                </p>
                <p className="text-grey-text text-xs">Premium User</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 p-3 bg-deep-grey-light border border-grey-border rounded-lg hover:bg-deep-grey-dark transition-all shadow-lg"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Sidebar;
