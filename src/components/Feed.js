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

const client = generateClient();

export default function Feed({ reload, onUserClick }) {
  const [posts, setPosts] = useState([]);
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const user = await getCurrentUser();
      setCurrentUserId(user.userId);

      // 1. Fetch posts
      const res = await client.graphql({
        query: listPosts,
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

      setPosts(postsWithUrls.filter(p => p !== null));

    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este post?")) return;

    try {
      await client.graphql({
        query: deletePost,
        variables: { input: { id: postId } }
      });

      setPosts(prev => prev.filter(p => p.id !== postId));
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
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button
          onClick={() => setViewMode("all")}
          className={`font-bold pb-2 px-2 transition ${viewMode === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Para ti
        </button>
        <button
          onClick={() => setViewMode("following")}
          className={`font-bold pb-2 px-2 transition ${viewMode === "following" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Siguiendo
        </button>
      </div>

      {loading && <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}

      {posts.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm">
          <p className="text-lg">No hay publicaciones aún.</p>
          {viewMode === "following" && <p className="text-sm mt-2">¡Sigue a más personas para ver sus posts aquí!</p>}
        </div>
      )}

      <div className="space-y-6">
        {posts.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">

            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  onClick={() => onUserClick && onUserClick(p.user)}
                  className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner cursor-pointer hover:opacity-80 transition"
                >
                  {p.user?.avatarUrl ? (
                    <img src={p.user.avatarUrl} alt={p.user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    p.user?.username?.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p
                      onClick={() => onUserClick && onUserClick(p.user)}
                      className="font-bold text-gray-900 cursor-pointer hover:underline"
                    >
                      @{p.user?.username || "Usuario"}
                    </p>
                    {currentUserId && p.userID !== currentUserId && (
                      <FollowButton targetUserId={p.userID} />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {currentUserId && p.userID === currentUserId && (
                <button
                  onClick={() => handleDeletePost(p.id)}
                  className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
                  title="Eliminar post"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{p.content}</p>
            </div>

            {/* Image */}
            {p.imageUrl && (
              <div className="mt-2">
                <img
                  src={p.imageUrl}
                  alt="post"
                  className="w-full object-cover max-h-[500px]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
              <div className="flex items-center space-x-6">
                <LikeButton postID={p.id} />
                <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">Comentar</span>
                </button>
              </div>

              <Comments postId={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
