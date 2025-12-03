import React, { useEffect, useState, useCallback } from "react";
import { generateClient } from "aws-amplify/api";
import { listComments } from "../graphql/queries";
import { deleteComment, createComment } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "@aws-amplify/storage";
import ConfirmationModal from "./ConfirmationModal";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function Comments({ postId }) {
  const { colors } = useTheme();
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
      // Custom query to fetch comments with user details
      const listCommentsWithUser = /* GraphQL */ `
        query ListComments(
          $filter: ModelCommentFilterInput
          $limit: Int
        ) {
          listComments(filter: $filter, limit: $limit) {
            items {
              id
              postID
              userID
              content
              createdAt
              updatedAt
              user {
                id
                username
                avatar
              }
            }
          }
        }
      `;

      const res = await client.graphql({
        query: listCommentsWithUser,
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
      const res = await client.graphql({
        query: createComment,
        variables: {
          input: {
            postID: postId,
            content: text,
            userID: currentUserId
          },
        },
      });

      // Create Notification
      // We need post owner.
      const postRes = await client.graphql({
        query: `
          query GetPostOwner($id: ID!) {
            getPost(id: $id) {
              userID
            }
          }
        `,
        variables: { id: postId }
      });
      const postOwnerID = postRes.data.getPost.userID;

      // Custom mutation to avoid fetching post details
      const createNotificationSimple = /* GraphQL */ `
        mutation CreateNotification(
          $input: CreateNotificationInput!
        ) {
          createNotification(input: $input) {
            id
            type
            content
            senderID
            receiverID
            createdAt
          }
        }
      `;

      if (postOwnerID && postOwnerID !== currentUserId) {
        await client.graphql({
          query: createNotificationSimple,
          variables: {
            input: {
              type: "COMMENT",
              content: `comentó: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}"`,
              senderID: currentUserId,
              receiverID: postOwnerID,
              postID: postId
            }
          }
        });
      }

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

      const deletedComment = comments.find(c => c.id === deleteConfirm);
      setComments(prev => prev.filter(c => c.id !== deleteConfirm));
      setDeleteConfirm(null);

      // Remove Notification (Best effort match)
      if (deletedComment) {
        try {
          const { listNotifications } = require("../graphql/queries");
          const { deleteNotification } = require("../graphql/mutations");

          const notifRes = await client.graphql({
            query: listNotifications,
            variables: {
              filter: {
                senderID: { eq: currentUserId },
                type: { eq: "COMMENT" },
                postID: { eq: postId },
                // We try to match content roughly or just by post/sender/type
                // Since we don't store commentID in notification, this is imperfect but works for most cases
              }
            }
          });

          const potentialNotifs = notifRes.data.listNotifications.items;
          // Filter by content match to be safer
          const targetNotif = potentialNotifs.find(n => n.content.includes(deletedComment.content.substring(0, 10)));

          if (targetNotif) {
            await client.graphql({
              query: deleteNotification,
              variables: { input: { id: targetNotif.id } }
            });
          }
        } catch (e) {
          console.warn("Error removing notification:", e);
        }
      }
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
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: colors.bgSecondary, color: colors.textSecondary }}>
              {c.user?.avatarUrl ? (
                <img src={c.user.avatarUrl} alt={c.user.username} className="w-full h-full object-cover" />
              ) : (
                c.user?.username?.charAt(0).toUpperCase() || "?"
              )}
            </div>

            <div className="p-3 rounded-2xl rounded-tl-none flex-grow relative group transition-colors"
              style={{ backgroundColor: colors.bgSecondary }}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs" style={{ color: colors.text }}>
                  @{c.user ? c.user.username : "Usuario"}
                </span>
                <span className="text-[10px]" style={{ color: colors.textSecondary }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: colors.text }}>{c.content}</p>

              {currentUserId === c.userID && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition hover:text-red-500"
                  style={{ color: colors.textTertiary }}
                  title="Borrar"
                >
                  <Icons.X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center">
        <input
          className="flex-1 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-violet-100 outline-none transition"
          style={{
            backgroundColor: colors.bgSecondary,
            borderColor: colors.border,
            borderWidth: '1px',
            color: colors.text
          }}
          placeholder="Escribe un comentario..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addComment()}
        />
        <button
          onClick={addComment}
          disabled={loading || !text.trim()}
          className="font-semibold text-sm hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition px-2"
          style={{ color: colors.primary }}
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
