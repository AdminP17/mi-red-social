import React, { useState, useEffect } from "react";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./amplify-config";

import { generateClient } from "aws-amplify/api";
import { getUserProfile } from "./graphql/queries";
import { createUserProfile } from "./graphql/mutations";

import CreatePost from "./components/CreatePost";
import Feed from "./components/Feed";
import SearchBar from "./components/SearchBar";
import Notifications from "./components/Notifications";
import UserProfile from "./components/UserProfile";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";

import PostDetail from "./components/PostDetail";
import Sidebar from "./components/Sidebar";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

const client = generateClient();

const components = {
  Header() {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-violet-200">
          <span className="text-3xl text-white font-bold">P</span>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">P17 Social</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Conéctate con el mundo</p>
      </div>
    );
  },
};

function MainContent() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [reloadFeed, setReloadFeed] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [dbUser, setDbUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  // ⭐ CREA AUTOMÁTICAMENTE EL USERPROFILE si no existe
  const creatingProfile = React.useRef(false);

  useEffect(() => {
    async function ensureProfile() {
      if (!user || creatingProfile.current) return;

      try {
        creatingProfile.current = true;

        // Check by ID (more robust)
        const result = await client.graphql({
          query: getUserProfile,
          variables: { id: user.userId }
        });

        if (result.data.getUserProfile) {
          setDbUser(result.data.getUserProfile);
        }

        const exists = !!result.data.getUserProfile;

        if (!exists) {
          console.log("Perfil no encontrado, creando...");
          await client.graphql({
            query: createUserProfile,
            variables: {
              input: {
                id: user.userId, // 🔥 IMPORTANT: Force ID to match Cognito Sub
                username: user.username,
                bio: "",
                avatar: ""
              }
            }
          });

          console.log("Perfil creado automáticamente");
        }
      } catch (err) {
        console.error("Error verificando/creando perfil:", JSON.stringify(err, null, 2));
      } finally {
        creatingProfile.current = false;
      }
    }

    ensureProfile();
  }, [user]);

  // Handle Tab Changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setViewingPost(null); // Reset viewing post
    if (tab === "home") {
      setViewingProfile(null);
      setReloadFeed(prev => prev + 1); // Refresh feed
    } else if (tab === "profile") {
      // 🔥 FIX: Map Amplify user to the format UserProfile expects
      setViewingProfile(dbUser ? { ...user, ...dbUser } : {
        id: user.userId,
        username: user.username,
      });
    } else if (tab === "notifications") {
      // Logic handled in render
      setViewingProfile(null);
    } else if (tab === "messages") {
      setSelectedChat(null); // Reset chat selection
      setViewingProfile(null);
    }
  };

  const { colors } = useTheme();

  return (
    <div className="min-h-screen flex justify-center transition-colors duration-300 font-sans" style={{ backgroundColor: colors.bg }}>

      {/* LEFT SIDEBAR */}
      <Sidebar
        user={dbUser ? { ...user, ...dbUser } : user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSignOut={signOut}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-2xl w-full min-h-screen relative" style={{ borderRight: `1px solid ${colors.border}` }}>

        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden sticky top-0 z-50 p-4 flex justify-between items-center backdrop-blur-xl border-b"
          style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">P17</h1>
          <button onClick={signOut} className="text-sm font-medium" style={{ color: colors.error }}>Salir</button>
        </div>

        {/* CONTENT SWITCHER */}
        {viewingProfile ? (
          <div className="p-0">
            <div className="sticky top-0 z-40 backdrop-blur-xl border-b p-4 flex items-center space-x-4"
              style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
              <button
                onClick={() => {
                  setViewingProfile(null);
                  setActiveTab("home");
                }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                style={{ color: colors.text }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Perfil</h2>
            </div>
            <UserProfile user={viewingProfile} onBack={() => {
              setViewingProfile(null);
              setActiveTab("home");
            }} />
          </div>
        ) : viewingPost ? (
          <div className="p-0">
            <div className="sticky top-0 z-40 backdrop-blur-xl border-b p-4 flex items-center space-x-4"
              style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
              <button
                onClick={() => setViewingPost(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                style={{ color: colors.text }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Publicación</h2>
            </div>
            <div className="p-4">
              <PostDetail
                postId={viewingPost}
                onBack={() => setViewingPost(null)}
                onUserClick={(u) => {
                  setViewingPost(null);
                  setViewingProfile(u);
                  setActiveTab("profile_view");
                }}
              />
            </div>
          </div>
        ) : activeTab === "notifications" ? (
          <div className="min-h-screen">
            <div className="sticky top-0 z-40 backdrop-blur-xl border-b p-4"
              style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>Notificaciones</h2>
            </div>
            <div className="p-4">
              <Notifications
                onPostClick={(postId) => setViewingPost(postId)}
                onUserClick={(u) => {
                  setViewingProfile(u);
                  setActiveTab("profile_view");
                }}
              />
            </div>
          </div>
        ) : activeTab === "messages" ? (
          <div className="h-screen flex flex-col">
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                currentUser={user}
                onBack={() => setSelectedChat(null)}
              />
            ) : (
              <ChatList
                currentUser={user}
                onSelectChat={setSelectedChat}
              />
            )}
          </div>
        ) : (
          /* HOME FEED */
          <div className="pb-24">
            {/* Header / Title */}
            <div className="sticky top-0 backdrop-blur-xl z-40 border-b"
              style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
              <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-xl font-bold cursor-pointer transition-colors"
                  style={{ color: colors.text }}
                  onClick={() => {
                    setReloadFeed(r => r + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}>Inicio</h2>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xs md:hidden">
                  P
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: colors.border }}>
              <SearchBar onSelectUser={(u) => {
                setViewingProfile(u);
                setActiveTab("profile_view");
              }} currentUser={user} />
            </div>

            {/* Create Post */}
            <div className="p-4 border-b" style={{ borderColor: colors.border }}>
              <CreatePost user={dbUser ? { ...user, ...dbUser } : user} onPostCreated={() => setReloadFeed(r => r + 1)} />
            </div>

            {/* Feed */}
            <Feed
              reload={reloadFeed}
              onUserClick={(u) => {
                setViewingProfile(u);
                setActiveTab("profile_view");
              }}
            />
          </div>
        )}
      </main>

      {/* RIGHT SIDEBAR (Suggestions / Search / Etc) - Optional */}
      <div className="hidden lg:block w-96 p-8 sticky top-0 h-screen overflow-y-auto">
        <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
          <h3 className="font-bold mb-4 text-lg" style={{ color: colors.text }}>A quién seguir</h3>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm mt-6 text-center font-medium" style={{ color: colors.primary }}>Mostrar más</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium px-4" style={{ color: colors.textTertiary }}>
          <a href="#" className="hover:underline">Condiciones</a>
          <a href="#" className="hover:underline">Privacidad</a>
          <a href="#" className="hover:underline">Cookies</a>
          <a href="#" className="hover:underline">Accesibilidad</a>
          <span>© 2025 P17 Social</span>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV (Optional, for better UX on phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around p-4 z-50 backdrop-blur-xl border-t safe-area-bottom"
        style={{ backgroundColor: `${colors.surface}F0`, borderColor: colors.border }}>
        <button onClick={() => handleTabChange("home")} className={`p-2 rounded-xl transition-all ${activeTab === 'home' ? 'bg-violet-100 text-violet-600' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'home' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </button>
        <button onClick={() => handleTabChange("notifications")} className={`p-2 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-violet-100 text-violet-600' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'notifications' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button onClick={() => handleTabChange("messages")} className={`p-2 rounded-xl transition-all ${activeTab === 'messages' ? 'bg-violet-100 text-violet-600' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </button>
        <button onClick={() => handleTabChange("profile")} className={`p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-violet-100 text-violet-600' : 'text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'profile' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
      </div>

    </div>
  );
}

function AppContent() {
  const { user } = useAuthenticator((context) => [context.user]);

  if (user) {
    return <MainContent />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/30 blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-400/30 blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10">
        <Authenticator components={components} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Authenticator.Provider>
        <AppContent />
      </Authenticator.Provider>
    </ThemeProvider>
  );
}
