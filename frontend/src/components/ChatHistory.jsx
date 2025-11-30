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
import { Trash2, MessageSquare, Plus, LogOut, Ellipsis } from "lucide-react";
import {
  isToday,
  isYesterday,
  isWithinInterval,
  subDays,
  startOfDay,
} from "date-fns";

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
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredChatId, setHoveredChatId] = useState(null);

  useEffect(() => {
    if (!user) return;

    try {
      // Query Firestore for user's chats
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const chatData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(chatData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching chats:", error);
          console.warn(
            "Firestore may not be enabled. Please enable it in Firebase Console."
          );
          setLoading(false);
        }
      );

      // Cleanup subscription on unmount
      return () => unsubscribe();
    } catch (error) {
      console.error("Firestore initialization error:", error);
      setLoading(false);
    }
  }, [user]);

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete

    if (!window.confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "chats", chatId));
      console.log("Chat deleted:", chatId);
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat. Please try again.");
    }
  };

  const renderChatItem = (chat) => {
    const isActive = chat.id === activeChatId;
    const isHovered = chat.id === hoveredChatId;

    return (
      <button
        key={chat.id}
        onClick={() => onChatSelect(chat.id)}
        onMouseEnter={() => setHoveredChatId(chat.id)}
        onMouseLeave={() => setHoveredChatId(null)}
        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group relative ${
          isActive
            ? "bg-gradient-to-r from-teal-600/20 to-teal-500/20 border border-teal-500/30 text-teal-100"
            : "text-gray-300 hover:bg-teal-900/20 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2 pr-8">
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate flex-1">
            {chat.title || "Untitled Chat"}
          </span>
        </div>

        {/* Delete button - shows on hover */}
        {isHovered && (
          <button
            onClick={(e) => handleDeleteChat(e, chat.id)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-red-500/20 transition-colors"
            title="Delete conversation"
          >
            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </button>
        )}
      </button>
    );
  };

  const renderGroup = (title, chats) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs text-teal-500/70 font-medium px-3 mb-2 uppercase tracking-wide">
          {title}
        </h3>
        <div className="space-y-1">{chats.map(renderChatItem)}</div>
      </div>
    );
  };

  const groupedChats = groupChatsByDate(chats);

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Sign out error:", error);
      }
    }
  };

  return (
    <div className="w-[260px] h-screen bg-[#171717] text-white flex flex-col">
      {/* Header with New Chat button */}
      <div className="p-3 border-b border-gray-800">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-teal-600/20 to-teal-500/20 hover:from-teal-600/30 hover:to-teal-500/30 border border-teal-500/30 rounded-lg transition-all duration-300"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-medium text-teal-100">New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto px-2 py-3 custom-scroll">
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
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-teal-900/20 rounded-lg transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 text-left truncate">
            <p className="text-xs text-white truncate font-medium">
              {user?.displayName || user?.email}
            </p>
          </div>
          <LogOut className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
        </button>
      </div>
    </div>
  );
}
