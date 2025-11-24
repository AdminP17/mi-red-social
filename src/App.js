import React, { useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "./amplify-config";

import CreatePost from "./components/CreatePost";
import Feed from "./components/Feed";

function App({ signOut, user }) {
  const [reloadFeed, setReloadFeed] = useState(0);

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

        {/* Crear post */}
        <div className="bg-white shadow rounded-xl p-4">
          <CreatePost
            user={user}
            onPostCreated={() => setReloadFeed(r => r + 1)}
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
