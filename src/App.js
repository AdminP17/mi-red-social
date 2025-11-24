import React, { useState, useEffect } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "./amplify-config";

import { generateClient } from "aws-amplify/api";
import { listUserProfiles } from "./graphql/queries";
import { createUserProfile } from "./graphql/mutations";

import CreatePost from "./components/CreatePost";
import Feed from "./components/Feed";
import SearchBar from "./components/SearchBar";

const client = generateClient();

function App({ signOut, user }) {
  const [reloadFeed, setReloadFeed] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  // ⭐ CREA AUTOMÁTICAMENTE EL USERPROFILE si no existe
  useEffect(() => {
    async function ensureProfile() {
      try {
        const result = await client.graphql({
          query: listUserProfiles,
          variables: {
            filter: { username: { eq: user.username } }
          }
        });

        const exists = result.data.listUserProfiles.items.length > 0;

        if (!exists) {
          await client.graphql({
            query: createUserProfile,
            variables: {
              input: {
                username: user.username,
                bio: "",
                avatar: ""
              }
            }
          });

          console.log("Perfil creado automáticamente");
        }
      } catch (err) {
        console.error("Error creando perfil:", err);
      }
    }

    ensureProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* NAVBAR */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-700">
          Bienvenido <span className="text-blue-600">{user.username}</span>
        </h1>

        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </nav>

      {/* CONTENIDO */}
      <div className="max-w-2xl mx-auto mt-6 px-4 space-y-6">

        {/* 🔍 Barra de búsqueda */}
        <div className="bg-white shadow rounded-xl p-4">
          <SearchBar onSelectUser={(u) => setSelectedUser(u)} />
        </div>

        {/* Resultado */}
        {selectedUser && (
          <div className="bg-white shadow rounded-xl p-4 border">
            <h3 className="text-lg font-semibold">@{selectedUser.username}</h3>
            <p className="text-gray-600">{selectedUser.bio}</p>

            <div className="mt-3">
              <p className="text-sm text-gray-500">
                (Aquí irá el botón "Seguir / Dejar de seguir")
              </p>
            </div>
          </div>
        )}

        {/* Crear post */}
        <div className="bg-white shadow rounded-xl p-4">
          <CreatePost
            user={user}
            onPostCreated={() => setReloadFeed((r) => r + 1)}
          />
        </div>

        {/* Feed */}
        <div className="bg-white shadow rounded-xl p-4">
          <Feed reload={reloadFeed} />
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
