import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { Trash2, MessageSquare, Plus, LogOut, Ellipsis, X } from "lucide-react";
import LogoutModal from "./LogoutModal";
import {
  isToday,
  isYesterday,
  isWithinInterval,
  subDays,
  startOfDay,
} from "date-fns";
import logger from "../utils/logger";

/**
 * Helper function to group chats by date categories
 * @param {Array} chats - Array of chat objects with createdAt timestamps
 * @returns {Object} - Grouped chats by date categories
 */
const groupChatsByDate = (chats) => {
  const groups = {
    today: [],
    yesterday: [],
    previous7Days: [],
    previous30Days: [],
    older: [],
  };

  const now = new Date();
  const sevenDaysAgo = startOfDay(subDays(now, 7));
  const thirtyDaysAgo = startOfDay(subDays(now, 30));

  chats.forEach((chat) => {
    // Convert Firestore Timestamp to JavaScript Date
    const chatDate = chat.createdAt?.toDate
      ? chat.createdAt.toDate()
      : new Date(chat.createdAt);

    if (isToday(chatDate)) {
      groups.today.push(chat);
    } else if (isYesterday(chatDate)) {
      groups.yesterday.push(chat);
    } else if (
      isWithinInterval(chatDate, { start: sevenDaysAgo, end: subDays(now, 2) })
    ) {
      groups.previous7Days.push(chat);
    } else if (
      isWithinInterval(chatDate, { start: thirtyDaysAgo, end: sevenDaysAgo })
    ) {
      groups.previous30Days.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
};

export default function ChatHistory({
  user,
  activeChatId,
  onChatSelect,
  onNewChat,
  isSidebarOpen,
  toggleSidebar,
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!user) {
      logger.log("⚠️ No user, clearing chats");
      setChats([]);
      setLoading(false);
      return;
    }

    logger.log("📡 Setting up chat listener for user:", user.uid);
    setLoading(true);

    try {
      // Query Firestore for user's chats (NO orderBy to avoid index requirement)
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("userId", "==", user.uid));

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          logger.log("📦 Snapshot received:", snapshot.docs.length, "chats");

          const chatData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sort manually by updatedAt (most recent first)
          chatData.sort((a, b) => {
            const timeA =
              a.updatedAt?.toMillis?.() || a.updatedAt?.getTime?.() || 0;
            const timeB =
              b.updatedAt?.toMillis?.() || b.updatedAt?.getTime?.() || 0;
            return timeB - timeA;
          });

          logger.log("📋 Chats updated:", chatData.length);
          setChats(chatData);
          setLoading(false);
        },
        (error) => {
          logger.error("❌ Error fetching chats:", error);
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => {
        logger.log("🧹 Cleaning up chat listener");
        unsubscribe();
      };
    } catch (error) {
      logger.error("❌ Firestore initialization error:", error);
      setLoading(false);
    }
  }, [user]);

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete

    try {
      await deleteDoc(doc(db, "chats", chatId));
      logger.log("Chat deleted:", chatId);
    } catch (error) {
      logger.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeChatId;
    const isHovered = chat.id === hoveredChatId;

    return (
      <div
        key={chat.id}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
        className="relative"
      >
        <button
          onClick={() => onChatSelect(chat.id)}
          className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl transition-all duration-200 group active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
            isActive
              ? "bg-teal-500/10 border border-teal-500/20 text-white shadow-sm"
              : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2 pr-8">
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate flex-1 break-words">
              {chat.title || "Untitled Chat"}
            </span>
          </div>
        </button>

        {/* Delete button - positioned outside the main button */}
        {isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteChat(e, chat.id);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-red-500/20 transition-colors z-10"
            title="Delete conversation"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        )}
      </div>
    );
  };

  const renderGroup = (title, chats) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-[10px] font-medium px-3 mb-2 uppercase tracking-widest text-teal-400">
          {title}
        </h3>
        <div className="space-y-0.5">{chats.map(renderChatItem)}</div>
      </div>
    );
  };

  const groupedChats = groupChatsByDate(chats);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
    } catch (error) {
      logger.error("Sign out error:", error);
    }
  };

  const handleLogoutClick = () => {
    // On mobile, close sidebar first so modal is clearly visible
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }

    setShowLogoutModal(true);
  };

  const handleNewChat = () => {
    // Close sidebar on mobile when new chat is clicked
    if (window.innerWidth < 768 && isSidebarOpen) {
      toggleSidebar();
    }
    onNewChat();
  };

  return (
    <>
      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutModal(false)}
      />

      <div
        className={`
        fixed md:relative inset-y-0 left-0 z-50 
        w-[280px] md:w-[260px] h-[100dvh] sidebar-glass text-white flex flex-col
        transform transition-all duration-300 ease-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
        ${!isSidebarOpen ? "md:w-0 md:hidden" : ""}
      `}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Header with New Chat Button and Close Button */}
        <div className="p-3 border-b border-white/5 sticky top-0 bg-[#171717]/80 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between mb-3 md:hidden">
            <h2 className="text-base font-semibold tracking-tight">
              Conversations
            </h2>
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/5 rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              title="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </button>
          </div>

          {/* Desktop Close Button */}
          <div className="hidden md:flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Chats
            </h2>
            <button
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              className="p-1.5 hover:bg-white/5 rounded-lg transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              title="Close sidebar"
            >
              <X className="w-4 h-4 text-gray-500" aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 min-h-[48px] bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-200 group active:scale-[0.98] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            title="Start a new conversation"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              New Chat
            </span>
          </button>
        </div>

        {/* Chat History - with scroll chaining prevention */}
        <div
          className="flex-1 overflow-y-auto px-2 py-3 custom-scroll"
          style={{ overscrollBehavior: "contain" }}
        >
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-400"></div>
              <p className="text-sm text-gray-500 mt-2">Loading chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <>
              {renderGroup("Today", groupedChats.today)}
              {renderGroup("Yesterday", groupedChats.yesterday)}
              {renderGroup("Previous 7 Days", groupedChats.previous7Days)}
              {renderGroup("Previous 30 Days", groupedChats.previous30Days)}
              {renderGroup("Older", groupedChats.older)}
            </>
          )}
        </div>

        {/* Footer - User info with logout button */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 min-h-[48px] text-sm text-gray-400 hover:bg-white/5 rounded-xl transition-all duration-200 group active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0 ring-1 ring-white/10">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-left truncate">
              <p className="text-xs text-gray-300 truncate font-medium tracking-tight">
                {user?.displayName || user?.email}
              </p>
            </div>
            <LogOut className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );
}
