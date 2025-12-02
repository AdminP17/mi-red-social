import React, { useState, useRef, useEffect } from "react";
import { generateClient } from "aws-amplify/api";
import { uploadData, getUrl } from "@aws-amplify/storage";
import { createPost } from "../graphql/mutations";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function CreatePost({ user, onPostCreated }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);
  const { colors } = useTheme();

  useEffect(() => {
    if (user?.avatar) {
      getUrl({ key: user.avatar })
        .then(res => setAvatarUrl(res.url.toString()))
        .catch(err => console.error("Error loading avatar in CreatePost:", err));
    } else {
      setAvatarUrl(null);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    try {
      let imageKey = null;
      if (image) {
        const filename = `${Date.now()}-${image.name}`;
        await uploadData({
          key: filename,
          data: image,
          options: {
            accessLevel: 'guest', // or 'protected'/'private' depending on your setup
          }
        }).result;
        imageKey = filename;
      }

      await client.graphql({
        query: createPost,
        variables: {
          input: {
            content,
            media: imageKey ? [imageKey] : [],
            userID: user.userId || user.username // Fallback if userId is missing (shouldn't happen with correct user obj)
          }
        }
      });

      setContent("");
      setImage(null);
      setPreview(null);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error al crear el post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl shadow-sm border p-4 transition-colors duration-300"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border
      }}>
      <div className="flex space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden"
            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || "U"
            )}
          </div>
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-slate-400 resize-none min-h-[80px]"
              placeholder="¿Qué estás pensando?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ color: colors.text }}
            />

            {preview && (
              <div className="relative mt-2 mb-4 rounded-xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                  <Icons.X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-3 border-t"
              style={{ borderColor: colors.border }}>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full transition-colors flex items-center space-x-2"
                  style={{ color: colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Añadir imagen"
                >
                  <Icons.Image size={20} />
                  <span className="text-sm font-medium hidden sm:inline">Foto</span>
                </button>
                {/* Placeholder for other attachments */}
                <button
                  type="button"
                  className="p-2 rounded-full transition-colors"
                  style={{ color: colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Añadir GIF"
                >
                  <span className="text-xs font-bold border border-current rounded px-1">GIF</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              <button
                type="submit"
                disabled={(!content.trim() && !image) || loading}
                className="px-6 py-2 rounded-full font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                style={{ backgroundColor: colors.primary }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Publicar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
