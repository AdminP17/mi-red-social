import React, { useState } from "react";
import { generateClient } from "@aws-amplify/api";
import { uploadData } from "@aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../graphql/mutations";

const client = generateClient();

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCreatePost() {
    setLoading(true);
    setErrorMsg("");

    // 1️⃣ Validar contenido
    if (!content || content.trim().length === 0) {
      setErrorMsg("Escribe algo antes de publicar.");
      setLoading(false);
      return;
    }

    try {
      // 2️⃣ Obtener usuario autenticado
      const authUser = await getCurrentUser();
      console.log("Usuario actual:", authUser);

      const userID = authUser?.userId;
      if (!userID) {
        setErrorMsg("Tu sesión no es válida. Cierra sesión y vuelve a entrar.");
        setLoading(false);
        return;
      }

      let mediaArray = [];

      // 3️⃣ Subir archivo si existe
      if (file) {
        const key = `posts/${uuidv4()}-${file.name}`;
        const uploadRes = await uploadData({
          key,
          data: file,
        }).result;

        console.log("Archivo subido:", uploadRes);
        mediaArray = [key];
      }

      // 4️⃣ Crear post
      const res = await client.graphql({
        query: createPost,
        variables: {
          input: {
            content: content.trim(),
            media: mediaArray,
            userID: userID,
          },
        },
      });

      console.log("Post creado:", res);

      // 5️⃣ Notificar a App.js para recargar el feed 🔥
      if (onPostCreated) onPostCreated();

      // Reset
      setContent("");
      setFile(null);
      setLoading(false);

      

    } catch (err) {
      console.error("Error publicando post:", err);
      setErrorMsg("Error al publicar. Revisa tu configuración o tu sesión.");
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: 30 }}>
      <textarea
        placeholder="¿Qué estás pensando?"
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      {errorMsg && (
        <p style={{ color: "red", marginTop: 8 }}>{errorMsg}</p>
      )}

      <button onClick={handleCreatePost} disabled={loading}>
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </div>
  );
}
