import React, { useState } from "react";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "./amplify-config";
import CreatePost from "./components/CreatePost";
import Feed from "./components/Feed";

function App({ signOut, user }) {
  // 🔥 Estado que hará que el feed se recargue cuando cambie
  const [reloadFeed, setReloadFeed] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido {user.username}</h1>

      {/* 🔥 Pasamos un callback a CreatePost */}
      <CreatePost
        user={user}
        onPostCreated={() => setReloadFeed(r => r + 1)}
      />

      {/* 🔥 Le pasamos el estado al Feed */}
      <Feed reload={reloadFeed} />

      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}

export default withAuthenticator(App);
