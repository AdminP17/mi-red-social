import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { getPost } from "../graphql/queries";
import { getUrl } from "@aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import LikeButton from "./LikeButton";
import Comments from "./Comments";
import FollowButton from "./FollowButton";
import ImageModal from "./ImageModal";
import ConfirmationModal from "./ConfirmationModal";
import { deletePost } from "../graphql/mutations";

const client = generateClient();

export default function PostDetail({ postId, onBack, onUserClick }) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadPost();
    }, [postId]);

    async function loadPost() {
        setLoading(true);
        try {
            const user = await getCurrentUser();
            setCurrentUserId(user.userId);

            const res = await client.graphql({
                query: getPost,
                variables: { id: postId }
            });

            const p = res.data.getPost;

            if (!p) {
                setPost(null);
                return;
            }

            // Load images
            if (p.media && p.media.length > 0) {
                try {
                    const urlResult = await getUrl({ key: p.media[0] });
                    p.imageUrl = urlResult.url.toString();
                } catch (e) {
                    console.warn("Error loading image URL:", e);
                }
            }

            // Load avatar
            if (p.user && p.user.avatar) {
                try {
                    const avatarUrlResult = await getUrl({ key: p.user.avatar });
                    p.user.avatarUrl = avatarUrlResult.url.toString();
                } catch (e) {
                    console.warn("Error loading avatar URL:", e);
                }
            }

            setPost(p);
        } catch (err) {
            console.error("Error loading post:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeletePost() {
        if (!deleteConfirm) return;
        try {
            await client.graphql({
                query: deletePost,
                variables: { input: { id: deleteConfirm } }
            });
            onBack(); // Go back after delete
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("No se pudo eliminar el post.");
        }
    }

    if (loading) return <div className="text-center py-10">Cargando...</div>;
    if (!post) return <div className="text-center py-10">Post no encontrado.</div>;

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 text-blue-600 font-bold hover:underline flex items-center"
            >
                ← Volver
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            onClick={() => onUserClick && onUserClick(post.user)}
                            className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg shadow-inner cursor-pointer hover:opacity-80 transition"
                        >
                            {post.user?.avatarUrl ? (
                                <img src={post.user.avatarUrl} alt={post.user.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                post.user?.username?.charAt(0).toUpperCase() || "?"
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <p
                                    onClick={() => onUserClick && onUserClick(post.user)}
                                    className="font-bold text-gray-900 cursor-pointer hover:underline"
                                >
                                    @{post.user?.username || "Usuario"}
                                </p>
                                {currentUserId && post.userID !== currentUserId && (
                                    <FollowButton targetUserId={post.userID} />
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                                {currentUserId === post.userID && (
                                    <button
                                        onClick={() => setDeleteConfirm(post.id)}
                                        className="text-gray-400 hover:text-red-500 transition p-1"
                                        title="Eliminar publicación"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <div className="px-4 py-2">
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    {post.imageUrl && (
                        <div className="mt-2">
                            <img
                                src={post.imageUrl}
                                alt="post"
                                className="w-full object-cover max-h-[500px] rounded-lg cursor-pointer"
                                onClick={() => setSelectedImage(post.imageUrl)}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center space-x-6">
                        <LikeButton postID={post.id} />
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-medium">Comentar</span>
                        </button>
                    </div>

                    <Comments postId={post.id} />
                </div>
            </div>

            <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />

            <ConfirmationModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleDeletePost}
                title="¿Eliminar publicación?"
                message="¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer."
            />
        </div>
    );
}
