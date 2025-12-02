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
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function PostDetail({ postId, onBack, onUserClick }) {
    const { colors } = useTheme();
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

    if (loading) return (
        <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
    );

    if (!post) return (
        <div className="text-center py-10" style={{ color: colors.text }}>
            Post no encontrado.
        </div>
    );

    return (
        <div>
            <button
                onClick={onBack}
                className="mb-4 font-bold hover:underline flex items-center transition-colors"
                style={{ color: colors.primary }}
            >
                <Icons.ArrowLeft size={20} className="mr-1" />
                Volver
            </button>

            <div className="rounded-xl shadow-sm border overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            onClick={() => onUserClick && onUserClick(post.user)}
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer hover:opacity-80 transition overflow-hidden"
                            style={{ backgroundColor: colors.primaryLight, color: colors.primary }}
                        >
                            {post.user?.avatarUrl ? (
                                <img src={post.user.avatarUrl} alt={post.user.username} className="w-full h-full object-cover" />
                            ) : (
                                post.user?.username?.charAt(0).toUpperCase() || "?"
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <p
                                    onClick={() => onUserClick && onUserClick(post.user)}
                                    className="font-bold cursor-pointer hover:underline"
                                    style={{ color: colors.text }}
                                >
                                    @{post.user?.username || "Usuario"}
                                </p>
                                {currentUserId && post.userID !== currentUserId && (
                                    <FollowButton targetUserId={post.userID} />
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-xs" style={{ color: colors.textSecondary }}>{new Date(post.createdAt).toLocaleString()}</p>
                                {currentUserId === post.userID && (
                                    <button
                                        onClick={() => setDeleteConfirm(post.id)}
                                        className="transition p-1 hover:bg-red-50 rounded-full"
                                        style={{ color: colors.textTertiary }}
                                        title="Eliminar publicación"
                                    >
                                        <Icons.Trash size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <div className="px-4 py-2">
                    <p className="mb-3 text-base leading-relaxed whitespace-pre-wrap" style={{ color: colors.text }}>{post.content}</p>
                    {post.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
                            <img
                                src={post.imageUrl}
                                alt="post"
                                className="w-full object-cover max-h-[500px] cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                                onClick={() => setSelectedImage(post.imageUrl)}
                            />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t" style={{ borderColor: colors.border, backgroundColor: colors.bgSecondary }}>
                    <div className="flex items-center space-x-6 mb-4">
                        <LikeButton postID={post.id} />
                        <button className="flex items-center space-x-2 transition group" style={{ color: colors.textSecondary }}>
                            <div className="p-2 rounded-full group-hover:bg-violet-50 transition-colors">
                                <Icons.MessageCircle size={22} />
                            </div>
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
