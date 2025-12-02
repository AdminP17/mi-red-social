import React, { useState, useEffect } from "react";
import { generateClient } from "@aws-amplify/api";
import { uploadData, getUrl } from "@aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../graphql/mutations";

const client = generateClient();

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    async function loadAvatar() {
      if (user?.avatar) {
        try {
          const urlResult = await getUrl({ key: user.avatar });
          setAvatarUrl(urlResult.url.toString());
        } catch (e) {
          console.warn("Error loading avatar:", e);
        }
      }
    }
    loadAvatar();
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  async function handleCreatePost() {
    setLoading(true);
    setErrorMsg("");

    // 1️⃣ Validar contenido
    if ((!content || content.trim().length === 0) && !file) {
      setErrorMsg("Escribe algo o sube una foto.");
      setLoading(false);
      return;
    }

    try {
      // 2️⃣ Obtener usuario autenticado
      const authUser = await getCurrentUser();
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
        try {
          await uploadData({
            key,
            data: file,
          }).result;
          mediaArray = [key];
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          setErrorMsg("Error al subir la imagen.");
          setLoading(false);
          return;
        }
      }

      // 4️⃣ Crear post
      await client.graphql({
        query: createPost,
        variables: {
          input: {
            content: content.trim(),
            media: mediaArray,
            userID: userID,
          },
        },
      });

      // 5️⃣ Notificar a App.js para recargar el feed 🔥
      if (onPostCreated) onPostCreated();

      // Reset
      setContent("");
      setFile(null);
      setPreviewUrl(null);
      setLoading(false);

    } catch (err) {
      console.error("Error publicando post:", err);
      setErrorMsg("Error al publicar. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="p-2">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
          ) : (
            user?.username?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <div className="flex-grow">
          <textarea
            placeholder={`¿Qué estás pensando, ${user?.username || "usuario"}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={2}
            className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100 resize-none outline-none transition"
          />

          {previewUrl && (
            <div className="relative mt-2 mb-2">
              <img src={previewUrl} alt="Preview" className="w-full max-h-60 object-cover rounded-lg" />
              <button
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {errorMsg && (
            <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
          )}

          <div className="flex justify-between items-center mt-3">
            <label className="cursor-pointer text-blue-500 hover:bg-blue-50 p-2 rounded-full transition">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </label>

            <button
              onClick={handleCreatePost}
              disabled={loading || (!content.trim() && !file)}
              className={`px-6 py-2 rounded-full font-semibold text-white transition shadow-sm
                ${loading || (!content.trim() && !file)
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
