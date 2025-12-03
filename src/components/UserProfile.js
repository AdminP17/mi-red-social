import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { postsByUserID, followsByFollowerID, followsByFollowedID } from "../graphql/queries";
import { deleteUserProfile, updateUserProfile } from "../graphql/mutations";
import { getUrl, uploadData } from "@aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuidv4 } from "uuid";
import FollowButton from "./FollowButton";
import ImageModal from "./ImageModal";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function UserProfile({ user, onBack, onMessage }) {
    const { colors } = useTheme();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [currentUser, setCurrentUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [coverUrl, setCoverUrl] = useState(null);

    // Load Current User
    useEffect(() => {
        getCurrentUser().then(u => setCurrentUser(u)).catch(console.error);
    }, []);

    // Load Avatar & Cover URL if exists
    useEffect(() => {
        async function loadImages() {
            if (user?.avatar) {
                try {
                    const urlResult = await getUrl({ key: user.avatar });
                    setAvatarUrl(urlResult.url.toString());
                } catch (e) {
                    console.warn("Error loading avatar:", e);
                }
            }
            if (user?.coverImage) {
                try {
                    const urlResult = await getUrl({ key: user.coverImage });
                    setCoverUrl(urlResult.url.toString());
                } catch (e) {
                    console.warn("Error loading cover:", e);
                }
            }
        }
        loadImages();
    }, [user]);

    // Load Posts & Stats
    useEffect(() => {
        async function loadData() {
            if (!user?.id) return;
            setLoading(true);
            try {
                // 1. Posts
                const res = await client.graphql({
                    query: postsByUserID,
                    variables: { userID: user.id }
                });
                const items = res.data.postsByUserID.items;

                // Get URLs for posts
                const postsWithUrls = await Promise.all(
                    items.map(async (post) => {
                        if (post.media && post.media.length > 0) {
                            const fileKey = post.media[0];
                            try {
                                const urlResult = await getUrl({ key: fileKey });
                                post.imageUrl = urlResult.url.toString();
                            } catch (e) {
                                console.warn("Error loading image URL:", e);
                            }
                        }
                        return post;
                    })
                );

                postsWithUrls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(postsWithUrls);

                // 2. Stats (Followers/Following)
                const followersRes = await client.graphql({
                    query: followsByFollowedID,
                    variables: { followedID: user.id }
                });
                const followingRes = await client.graphql({
                    query: followsByFollowerID,
                    variables: { followerID: user.id }
                });

                setStats({
                    followers: followersRes.data.followsByFollowedID.items.length,
                    following: followingRes.data.followsByFollowerID.items.length
                });

            } catch (err) {
                console.error("Error loading user data:", err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [user]);

    // Handle Avatar Upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const key = `avatars/${uuidv4()}-${file.name}`;
            await uploadData({ key, data: file }).result;

            // Update User Profile
            await client.graphql({
                query: updateUserProfile,
                variables: {
                    input: {
                        id: user.id,
                        avatar: key
                    }
                }
            });

            // Update local state
            const urlResult = await getUrl({ key });
            setAvatarUrl(urlResult.url.toString());
            // alert("Foto de perfil actualizada!");

        } catch (err) {
            console.error("Error updating avatar:", err);
            alert("Error al actualizar la foto.");
        }
    };

    // Handle Cover Upload
    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const key = `covers/${uuidv4()}-${file.name}`;
            await uploadData({ key, data: file }).result;

            // Update User Profile
            await client.graphql({
                query: updateUserProfile,
                variables: {
                    input: {
                        id: user.id,
                        coverImage: key
                    }
                }
            });

            // Update local state
            const urlResult = await getUrl({ key });
            setCoverUrl(urlResult.url.toString());
            // alert("Portada actualizada!");

        } catch (err) {
            console.error("Error updating cover:", err);
            alert("Error al actualizar la portada.");
        }
    };

    const isOwnProfile = currentUser?.userId === user.id;
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="shadow-md rounded-xl overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: colors.surface }}>
            {/* Header / Cover */}
            <div className="h-32 relative group cursor-pointer" onClick={() => coverUrl && setSelectedImage(coverUrl)}>
                {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-violet-400 to-fuchsia-500"></div>
                )}

                <button
                    onClick={(e) => { e.stopPropagation(); onBack(); }}
                    className="absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm transition font-medium flex items-center z-10"
                    style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#FFFFFF' }}
                >
                    <Icons.ArrowLeft size={18} className="mr-1" />
                    Volver
                </button>

                {/* Edit Cover Button */}
                {isOwnProfile && (
                    <label
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-2 right-2 p-2 rounded-full cursor-pointer transition-all opacity-70 hover:opacity-100 hover:scale-110 z-20"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#FFFFFF' }}
                        title="Cambiar portada"
                    >
                        <Icons.Camera size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                    </label>
                )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div
                            className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden flex items-center justify-center cursor-pointer hover:opacity-90 transition"
                            style={{ borderColor: colors.surface, backgroundColor: colors.bgSecondary }}
                            onClick={() => avatarUrl && setSelectedImage(avatarUrl)}
                        >
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                                    style={{ color: colors.textTertiary }}>
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Edit Avatar Button - Repositioned */}
                        {isOwnProfile && (
                            <label
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-0 right-0 p-1.5 rounded-full cursor-pointer transition-all hover:scale-110 shadow-sm border-2"
                                style={{ backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }}
                                title="Cambiar foto de perfil"
                            >
                                <Icons.Camera size={16} />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 mb-4">
                        {/* Message Button */}
                        {onMessage && (
                            <button
                                onClick={() => onMessage(user)}
                                className="p-2 rounded-full border transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                                style={{ borderColor: colors.border, color: colors.text }}
                                title="Enviar mensaje"
                            >
                                <Icons.MessageCircle size={20} />
                            </button>
                        )}

                        {!isOwnProfile && <FollowButton targetUserId={user.id} />}
                    </div>
                </div>

                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>@{user.username}</h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{user.bio || "Sin biografía aún."}</p>

                {/* Stats */}
                <div className="flex space-x-6 mt-4 border-t border-b py-3" style={{ borderColor: colors.border }}>
                    <div className="text-center">
                        <span className="block font-bold" style={{ color: colors.text }}>{posts.length}</span>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Posts</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold" style={{ color: colors.text }}>{stats.followers}</span>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Seguidores</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold" style={{ color: colors.text }}>{stats.following}</span>
                        <span className="text-xs" style={{ color: colors.textSecondary }}>Siguiendo</span>
                    </div>
                </div>

                {/* Posts Grid */}
                <h3 className="text-lg font-bold mt-6 mb-3" style={{ color: colors.text }}>Publicaciones</h3>

                {loading && <div className="text-center py-4" style={{ color: colors.textSecondary }}>Cargando...</div>}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-8 rounded-lg" style={{ backgroundColor: colors.bgSecondary, color: colors.textSecondary }}>
                        No hay publicaciones aún.
                    </div>
                )}

                <div className="grid grid-cols-3 gap-1">
                    {posts.map(p => (
                        <div
                            key={p.id}
                            className="aspect-square relative overflow-hidden group cursor-pointer hover:opacity-90 transition"
                            style={{ backgroundColor: colors.bgSecondary }}
                            onClick={() => p.imageUrl && setSelectedImage(p.imageUrl)}
                        >
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt="Post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-xs text-center border"
                                    style={{ color: colors.textTertiary, borderColor: colors.border }}>
                                    {p.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
        </div>
    );
}
