import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { postsByUserID, followsByFollowerID, followsByFollowedID } from "../graphql/queries";
import { deleteUserProfile, updateUserProfile } from "../graphql/mutations";
import { getUrl, uploadData } from "@aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";
import { v4 as uuidv4 } from "uuid";
import FollowButton from "./FollowButton";
import ImageModal from "./ImageModal";

const client = generateClient();

export default function UserProfile({ user, onBack }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [currentUser, setCurrentUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);

    // Load Current User
    useEffect(() => {
        getCurrentUser().then(u => setCurrentUser(u)).catch(console.error);
    }, []);

    // Load Avatar URL if exists
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
            alert("Foto de perfil actualizada!");

        } catch (err) {
            console.error("Error updating avatar:", err);
            alert("Error al actualizar la foto.");
        }
    };

    const isOwnProfile = currentUser?.userId === user.id;
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-full backdrop-blur-sm transition font-medium"
                >
                    ← Volver
                </button>
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
                <div className="flex justify-between items-end -mt-12 mb-4">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Edit Avatar Overlay */}
                        {isOwnProfile && (
                            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-xs font-bold">
                                Cambiar
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mb-2">
                        {!isOwnProfile && <FollowButton targetUserId={user.id} />}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900">@{user.username}</h2>
                <p className="text-gray-600 text-sm mt-1">{user.bio || "Sin biografía aún."}</p>

                {/* Stats */}
                <div className="flex space-x-6 mt-4 border-t border-b py-3 border-gray-100">
                    <div className="text-center">
                        <span className="block font-bold text-gray-900">{posts.length}</span>
                        <span className="text-xs text-gray-500">Posts</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900">{stats.followers}</span>
                        <span className="text-xs text-gray-500">Seguidores</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-gray-900">{stats.following}</span>
                        <span className="text-xs text-gray-500">Siguiendo</span>
                    </div>
                </div>

                {/* Posts Grid */}
                <h3 className="text-lg font-bold mt-6 mb-3">Publicaciones</h3>

                {loading && <div className="text-center py-4 text-gray-500">Cargando...</div>}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                        No hay publicaciones aún.
                    </div>
                )}

                <div className="grid grid-cols-3 gap-1">
                    {posts.map(p => (
                        <div
                            key={p.id}
                            className="aspect-square bg-gray-100 relative overflow-hidden group cursor-pointer hover:opacity-90 transition"
                            onClick={() => p.imageUrl && setSelectedImage(p.imageUrl)}
                        >
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt="Post" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-xs text-gray-400 text-center border">
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
