import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Login from "./components/Login";
import Chat from "./components/Chat";
import ChatHistory from "./components/ChatHistory";
import SharedConversationPage from "./components/SharedConversationPage";
import ErrorBoundary from "./components/ErrorBoundary";

// Main chat application component
function ChatApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
    // Trigger a reset signal that Chat component will pick up
    // This ensures messages are cleared and input is focused
  };

  const handleChatSelect = (chatId) => {
    setActiveChatId(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    <div className="min-h-[100dvh] bg-richBlack overflow-x-hidden">
      {user ? (
        <div className="flex h-[100dvh] overflow-hidden relative">
          {/* Mobile Overlay - Only visible when sidebar is open on mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
              style={{ touchAction: "none" }}
              aria-hidden="true"
            />
          )}

          {/* Sidebar */}
          <ChatHistory
            user={user}
            activeChatId={activeChatId}
            onChatSelect={handleChatSelect}
            onNewChat={handleNewChat}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat
              user={user}
              activeChatId={activeChatId}
              onNewChat={handleNewChat}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
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

// Root App component with Router
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Shared conversation route - public */}
          <Route path="/share/:shareId" element={<SharedConversationPage />} />

          {/* Main app route */}
          <Route path="/*" element={<ChatApp />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
