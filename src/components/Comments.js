import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { listComments } from "../graphql/queries";
import { deleteComment, createComment } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "@aws-amplify/storage";
import ConfirmationModal from "./ConfirmationModal";

const client = generateClient();

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    getCurrentUser().then(u => setCurrentUserId(u.userId)).catch(() => { });
  }, []);

  const loadComments = useCallback(async () => {
    try {
      const res = await client.graphql({
        query: listComments,
        variables: {
          filter: { postID: { eq: postId } },
          limit: 100,
        },
      });

      // Sort by date asc
      const items = res.data.listComments.items || [];

      // Filter out orphaned comments
      const validComments = items.filter(c => c.user !== null);

      // Fetch avatars for comments
      const commentsWithAvatars = await Promise.all(
        validComments.map(async (c) => {
          if (c.user && c.user.avatar) {
            try {
              const urlResult = await getUrl({ key: c.user.avatar });
              c.user.avatarUrl = urlResult.url.toString();
            } catch (e) {
              console.warn("Error loading avatar for comment:", e);
            }
          }
          return c;
        })
      );

      commentsWithAvatars.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setComments(commentsWithAvatars);
    } catch (err) {
      console.error("Error loading comments:", err);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function addComment() {
    if (!text.trim()) return;
    setLoading(true);

    try {
      await client.graphql({
        query: createComment,
        variables: {
          input: {
            postID: postId,
            content: text,
            userID: currentUserId
          },
        },
      });

      setText("");
      loadComments();
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Error al publicar comentario");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId) {
    setDeleteConfirm(commentId);
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await client.graphql({
        query: deleteComment,
        variables: { input: { id: deleteConfirm } }
      });
      setComments(prev => prev.filter(c => c.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  }

  return (
    <div className="mt-4">
      {/* List */}
      <div className="space-y-4 mb-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {c.user?.avatarUrl ? (
                <img src={c.user.avatarUrl} alt={c.user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                  {c.user?.username?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none flex-grow relative group">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-gray-900">
                  @{c.user ? c.user.username : "Usuario"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 mt-1">{c.content}</p>

              {currentUserId === c.userID && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Borrar"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
          placeholder="Escribe un comentario..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addComment()}
        />
        <button
          onClick={addComment}
          disabled={loading || !text.trim()}
          className="text-blue-600 font-semibold text-sm hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition px-2"
        >
          Publicar
        </button>
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar comentario?"
        message="¿Estás seguro de que quieres eliminar este comentario?"
      />
    </div>
  );
}
