import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Login from "./components/Login";
import Chat from "./components/Chat";
import ChatHistory from "./components/ChatHistory";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
  };

  if (loading) {
    return (
      <div className="animated-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryWhite"></div>
          <p className="mt-4 text-mutedGrey">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richBlack">
      {user ? (
        <div className="flex h-screen">
          <ChatHistory 
            user={user} 
            activeChatId={activeChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
          />
          <div className="flex-1">
            <Chat user={user} activeChatId={activeChatId} onNewChat={handleNewChat} />
          </div>
        </div>
      ) : (
        <div className="animated-bg min-h-screen">
          <Login />
        </div>
      )}
    </div>
  );
}
