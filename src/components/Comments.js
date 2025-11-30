import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { listComments } from "../graphql/queries";
import { deleteComment, createComment } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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

      validComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setComments(validComments);
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
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("¿Eliminar comentario?")) return;
    try {
      await client.graphql({
        query: deleteComment,
        variables: { input: { id: commentId } }
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  }

  return (
    <div className="mt-4 pt-2">
      {comments.length > 0 && (
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2 group">
              <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-xs text-gray-600 font-bold">
                {c.user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="bg-gray-100 p-2 rounded-lg rounded-tl-none flex-grow relative">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-xs text-gray-900">
                    {c.user ? c.user.username : "Usuario"}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    {currentUserId && c.userID === currentUserId && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-800 text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
