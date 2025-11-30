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

import Sidebar from "./components/Sidebar";

const client = generateClient();

const components = {
  Header() {
    return (
      <div className="text-center p-6">
        <h1 className="text-3xl font-bold text-blue-600">Mi Red Social</h1>
        <p className="text-gray-500 mt-2">Conéctate con tus amigos</p>
      </div>
    );
  },
};



function MainContent() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [reloadFeed, setReloadFeed] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

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
    if (tab === "home") {
      setViewingProfile(null);
      setReloadFeed(prev => prev + 1); // Refresh feed
    } else if (tab === "profile") {
      // 🔥 FIX: Map Amplify user to the format UserProfile expects
      setViewingProfile({
        id: user.userId,
        username: user.username,
        // We don't have avatar/bio here yet, but UserProfile will fetch them or handle missing
      });
    } else if (tab === "notifications") {
      // Logic handled in render
      setViewingProfile(null);
    } else if (tab === "messages") {
      // Placeholder for messages
      alert("Sección de mensajes próximamente");
      setActiveTab("home");
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">

      {/* LEFT SIDEBAR */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSignOut={signOut}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-2xl w-full border-r border-gray-100 min-h-screen">

        {/* Mobile Header (visible only on small screens) */}
        <div className="md:hidden sticky top-0 bg-white z-50 p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">P17</h1>
          <button onClick={signOut} className="text-sm text-red-500">Salir</button>
        </div>

        {/* CONTENT SWITCHER */}
        {viewingProfile ? (
          <div className="p-4">
            <button
              onClick={() => {
                setViewingProfile(null);
                setActiveTab("home");
              }}
              className="mb-4 text-blue-600 font-bold hover:underline"
            >
              ← Volver
            </button>
            <UserProfile user={viewingProfile} onBack={() => {
              setViewingProfile(null);
              setActiveTab("home");
            }} />
          </div>
        ) : activeTab === "notifications" ? (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Notificaciones</h2>
            <Notifications />
          </div>
        ) : (
          /* HOME FEED */
          <div className="pb-20">
            {/* Header / Title */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-40 p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold cursor-pointer" onClick={() => {
                setReloadFeed(r => r + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}>Inicio</h2>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <SearchBar onSelectUser={(u) => {
                setViewingProfile(u);
                setActiveTab("profile_view"); // Custom state for viewing others
              }} currentUser={user} />
            </div>

            {/* Create Post */}
            <div className="p-4 border-b border-gray-100">
              <CreatePost user={user} onPostCreated={() => setReloadFeed(r => r + 1)} />
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
      <div className="hidden lg:block w-80 p-6 pl-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-bold text-gray-900 mb-2">A quién seguir</h3>
          <p className="text-sm text-gray-500">Próximamente...</p>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          © 2025 P17 Social App
        </div>
      </div>

      {/* MOBILE BOTTOM NAV (Optional, for better UX on phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 z-50">
        <button onClick={() => handleTabChange("home")} className="text-2xl">🏠</button>
        <button onClick={() => handleTabChange("notifications")} className="text-2xl">🔔</button>
        <button onClick={() => handleTabChange("profile")} className="text-2xl">👤</button>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
        <Authenticator components={components} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Authenticator.Provider>
      <AppContent />
    </Authenticator.Provider>
  );
}
