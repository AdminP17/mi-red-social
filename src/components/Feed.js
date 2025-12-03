import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getUrl } from "@aws-amplify/storage";
import { listPosts, followsByFollowerID } from "../graphql/queries";
import { deletePost } from "../graphql/mutations";
import { onCreatePost } from "../graphql/subscriptions";
import { getCurrentUser } from "aws-amplify/auth";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import FollowButton from "./FollowButton";
import ImageModal from "./ImageModal";
import ConfirmationModal from "./ConfirmationModal";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function Feed({ reload, onUserClick }) {
  const { colors } = useTheme();
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);

      // Custom query to fetch posts with user details
      const listPostsWithUser = /* GraphQL */ `
        query ListPosts(
          $filter: ModelPostFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              id
              userID
              content
              media
              createdAt
              updatedAt
              owner
              user {
                id
                username
                avatar
                coverImage
              }
            }
            nextToken
          }
        }
      `;

      // 1. Fetch posts
      const res = await client.graphql({
        query: listPostsWithUser,
        variables: { limit: 100 }
      });
      let allPosts = res.data.listPosts.items;

      // 2. Filter if in "following" mode
      if (viewMode === "following") {
        const followRes = await client.graphql({
          query: followsByFollowerID,
          variables: { followerID: user.userId }
        });

        const followingIds = new Set(followRes.data.followsByFollowerID.items.map(f => f.followedID));
        followingIds.add(user.userId); // Include my own posts

        allPosts = allPosts.filter(p => followingIds.has(p.userID));
      }

      // 3. Get URLs & Filter Orphaned Posts
      const postsWithUrls = await Promise.all(
        allPosts.map(async (post) => {
          // Filter out orphaned posts
          if (!post.user) return null;

          // Post Image
          if (post.media && post.media.length > 0) {
            const fileKey = post.media[0];
            try {
              const urlResult = await getUrl({ key: fileKey });
              post.imageUrl = urlResult.url.toString();
            } catch (e) {
              console.warn("Error loading image URL:", e);
            }
          }

          // User Avatar
          if (post.user && post.user.avatar) {
            try {
              const avatarUrlResult = await getUrl({ key: post.user.avatar });
              post.user.avatarUrl = avatarUrlResult.url.toString();
            } catch (e) {
              console.warn("Error loading avatar URL:", e);
            }
          }

          return post;
        })
      );

      const sortedPosts = postsWithUrls
        .filter(p => p !== null)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setPosts(sortedPosts);

    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePost(postId) {
    // Confirmation handled in UI
    try {
      await client.graphql({
        query: deletePost,
        variables: { input: { id: postId } }
      });

      setPosts(prev => prev.filter(p => p.id !== postId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("No se pudo eliminar el post.");
    }
  }

  useEffect(() => {
    loadPosts();
  }, [reload, viewMode]);

  // Subscription
  useEffect(() => {
    const subscription = client
      .graphql({ query: onCreatePost })
      .subscribe({
        next: async () => {
          loadPosts();
        },
        error: (err) => console.error("Subscription error:", err),
      });

    return () => subscription.unsubscribe();
  }, [viewMode]);

  return (
    <div>
      {/* Toggle */}
      <div className="flex space-x-1 mb-6 p-1 rounded-xl mx-4"
        style={{ backgroundColor: colors.bgSecondary }}>
        <button
          onClick={() => setViewMode("all")}
          className="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
          style={{
            backgroundColor: viewMode === "all" ? colors.surface : 'transparent',
            color: viewMode === "all" ? colors.primary : colors.textSecondary,
            boxShadow: viewMode === "all" ? colors.shadow : 'none'
          }}
        >
          Para ti
        </button>
        <button
          onClick={() => setViewMode("following")}
          className="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
          style={{
            backgroundColor: viewMode === "following" ? colors.surface : 'transparent',
            color: viewMode === "following" ? colors.primary : colors.textSecondary,
            boxShadow: viewMode === "following" ? colors.shadow : 'none'
          }}
        >
          Siguiendo
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.bgSecondary }}>
            <Icons.Camera size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>No hay publicaciones aún</h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {viewMode === "following" ? "¡Sigue a más personas para ver sus posts aquí!" : "Sé el primero en compartir algo interesante."}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {posts.map((p) => (
          <div key={p.id} className="transition-all duration-200"
            style={{ borderBottom: `1px solid ${colors.border}` }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgSecondary}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >

            {/* Header */}
            <div className="px-4 pt-4 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div
                  onClick={() => onUserClick && onUserClick(p.user)}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm cursor-pointer hover:opacity-90 transition overflow-hidden"
                  style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                >
                  {p.user?.avatarUrl ? (
                    <img src={p.user.avatarUrl} alt={p.user.username} className="w-full h-full object-cover" />
                  ) : (
                    p.user?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p
                      onClick={() => onUserClick && onUserClick(p.user)}
                      className="font-bold cursor-pointer hover:underline text-sm"
                      style={{ color: colors.text }}
                    >
                      {p.user?.username || "Usuario"}
                    </p>
                    <span className="text-slate-400 text-xs">•</span>
                    <p className="text-xs" style={{ color: colors.textSecondary }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {currentUserId && p.userID !== currentUserId && (
                    <div className="mt-0.5">
                      <FollowButton targetUserId={p.userID} />
                    </div>
                  )}
                </div>
              </div>

              {currentUserId === p.userID && (
                <button
                  onClick={() => setDeleteConfirm(p.id)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: colors.textTertiary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2'; // red-50
                    e.currentTarget.style.color = '#EF4444'; // red-500
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.textTertiary;
                  }}
                  title="Eliminar publicación"
                >
                  <Icons.Trash size={16} />
                </button>
              )}
            </div>

            {/* Post Content */}
            <div className="px-4 py-3">
              <p className="mb-3 text-base leading-relaxed whitespace-pre-wrap" style={{ color: colors.text }}>{p.content}</p>
              {p.imageUrl && (
                <div className="mt-3 rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: colors.border }}>
                  <img
                    src={p.imageUrl}
                    alt="post"
                    className="w-full object-cover max-h-[500px] cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                    onClick={() => setSelectedImage(p.imageUrl)}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-4 pb-4">
              <div className="flex items-center space-x-6 mb-3">
                <LikeButton postID={p.id} />
                <button className="flex items-center space-x-2 transition group" style={{ color: colors.textSecondary }}>
                  <div className="p-2 rounded-full group-hover:bg-violet-50 transition-colors">
                    <Icons.MessageCircle size={20} />
                  </div>
                  <span className="font-medium text-sm">Comentar</span>
                </button>
                <button className="flex items-center space-x-2 transition group ml-auto" style={{ color: colors.textSecondary }}>
                  <div className="p-2 rounded-full group-hover:bg-violet-50 transition-colors">
                    <Icons.Share size={20} />
                  </div>
                </button>
              </div>

              <Comments postId={p.id} />
            </div>
          </div>
        ))}
      </div>

      <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDeletePost(deleteConfirm)}
        title="¿Eliminar publicación?"
        message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
      />
    </div>
  );
}
