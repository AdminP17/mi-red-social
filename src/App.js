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
  const [viewingProfile, setViewingProfile] = useState(null); // User object to view full profile

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

  if (viewingProfile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-bold text-gray-700">
            Mi Red Social
          </h1>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
          >
            Cerrar sesión
          </button>
        </nav>
        <div className="max-w-2xl mx-auto mt-6 px-4 pb-10">
          <UserProfile
            user={viewingProfile}
            onBack={() => setViewingProfile(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVBAR */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-gray-700">
          Bienvenido <span className="text-blue-600">{user?.username}</span>
        </h1>

        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-md"
        >
          Cerrar sesión
        </button>
      </nav>

      <Notifications />

      {/* CONTENIDO */}
      <div className="max-w-2xl mx-auto mt-6 px-4 space-y-6 pb-10">

        {/* 🔍 Barra de búsqueda */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <SearchBar onSelectUser={(u) => setSelectedUser(u)} currentUser={user} />
        </div>

        {/* Resultado */}
        {selectedUser && (
          <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100 relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-800">@{selectedUser.username}</h3>
            <p className="text-gray-600 mt-1">{selectedUser.bio || "Sin biografía"}</p>

            <div className="mt-4">
              <button
                onClick={() => {
                  setViewingProfile(selectedUser);
                  setSelectedUser(null);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
              >
                Ver perfil completo
              </button>
            </div>
          </div>
        )}

        {/* Crear post */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <CreatePost
            user={user}
            onPostCreated={() => setReloadFeed((r) => r + 1)}
          />
        </div>

        {/* Feed */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <Feed reload={reloadFeed} />
        </div>
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
