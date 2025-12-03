import React, { useState, useEffect } from "react";
import { getUrl } from "@aws-amplify/storage";
import { generateClient } from "aws-amplify/api";
import { deleteUser } from "aws-amplify/auth";
import {
    deleteUserProfile,
    deletePost,
    deleteComment,
    deleteLike,
    deleteFollow
} from "../graphql/mutations";
import {
    postsByUserID,
    commentsByUserID,
    likesByUserID,
    followsByFollowerID,
    followsByFollowedID
} from "../graphql/queries";
import ConfirmationModal from "./ConfirmationModal";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function Sidebar({ user, activeTab, onTabChange, onSignOut, unreadNotifsCount, unreadMessagesCount }) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { colors, theme, toggleTheme } = useTheme();

    const menuItems = [
        { id: "home", icon: Icons.Home, label: "Inicio", badge: 0 },
        { id: "notifications", icon: Icons.Bell, label: "Notificaciones", badge: unreadNotifsCount },
        { id: "messages", icon: Icons.MessageCircle, label: "Mensajes", badge: unreadMessagesCount },
        { id: "profile", icon: Icons.User, label: "Perfil", badge: 0 }
    ];

    useEffect(() => {
        if (user?.avatar) {
            getUrl({ key: user.avatar })
                .then(res => setAvatarUrl(res.url.toString()))
                .catch(err => console.error("Error loading sidebar avatar:", err));
        } else {
            setAvatarUrl(null);
        }
    }, [user]);

    useEffect(() => {
        if (user?.avatar) {
            getUrl({ key: user.avatar })
                .then(res => setAvatarUrl(res.url.toString()))
                .catch(err => console.error("Error loading sidebar avatar:", err));
        } else {
            setAvatarUrl(null);
        }
    }, [user]);

    const handleDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const userID = user.userId;

            // Helper to delete items in batches
            const deleteItems = async (query, queryVar, mutation, mutationInputKey = "id") => {
                let nextToken = null;
                do {
                    const res = await client.graphql({
                        query: query,
                        variables: { [queryVar]: userID, limit: 100, nextToken }
                    });
                    const items = res.data[Object.keys(res.data)[0]].items;
                    nextToken = res.data[Object.keys(res.data)[0]].nextToken;

                    await Promise.all(items.map(item =>
                        client.graphql({
                            query: mutation,
                            variables: { input: { id: item.id } }
                        }).catch(e => console.warn(`Failed to delete item ${item.id}:`, e))
                    ));
                } while (nextToken);
            };

            // 1. Delete Posts
            await deleteItems(postsByUserID, "userID", deletePost);

            // 2. Delete Comments
            await deleteItems(commentsByUserID, "userID", deleteComment);

            // 3. Delete Likes
            await deleteItems(likesByUserID, "userID", deleteLike);

            // 4. Delete Following (where I am the follower)
            await deleteItems(followsByFollowerID, "followerID", deleteFollow);

            // 5. Delete Followers (where I am being followed)
            await deleteItems(followsByFollowedID, "followedID", deleteFollow);

            // 6. Delete User Profile (Data)
            await client.graphql({
                query: deleteUserProfile,
                variables: { input: { id: userID } }
            });

            // 7. Delete Cognito User (Auth)
            await deleteUser();

            alert("Tu cuenta y todos tus datos han sido eliminados correctamente.");
            onSignOut();
        } catch (e) {
            console.error("Error deleting account:", e);
            alert("Error al eliminar la cuenta. Inténtalo de nuevo.");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="w-72 h-screen sticky top-0 flex flex-col p-6 hidden md:flex transition-colors duration-300"
            style={{
                backgroundColor: colors.surface,
                borderRight: `1px solid ${colors.border}`
            }}>
            {/* Logo */}
            <div className="mb-10 px-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg">
                        P
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>Social</h1>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: colors.bgSecondary }}
                    title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
                >
                    {theme === 'light' ? <Icons.Moon size={18} color={colors.textSecondary} /> : <Icons.Sun size={18} color={colors.textSecondary} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-200 relative group"
                        style={{
                            backgroundColor: activeTab === item.id ? colors.primaryLight : 'transparent',
                            color: activeTab === item.id ? colors.primary : colors.textSecondary,
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.backgroundColor = colors.bgSecondary;
                                e.currentTarget.style.color = colors.text;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeTab !== item.id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = colors.textSecondary;
                            }
                        }}
                    >
                        <item.icon
                            size={24}
                            weight={activeTab === item.id ? "fill" : "regular"}
                            color={activeTab === item.id ? colors.primary : "currentColor"}
                        />
                        <span>{item.label}</span>
                        {item.badge > 0 && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 text-white text-xs font-bold px-1.5 rounded-full absolute right-4 shadow-sm"
                                style={{ backgroundColor: colors.error }}>
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        )}
                    </button>
                ))}

                <div className="relative">
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-base font-medium transition-all duration-200"
                        style={{ color: colors.textSecondary }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.bgSecondary;
                            e.currentTarget.style.color = colors.text;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.textSecondary;
                        }}
                    >
                        <Icons.Settings size={24} color="currentColor" />
                        <span>Más</span>
                    </button>

                    {/* More Menu Dropdown */}
                    {showMoreMenu && (
                        <div className="absolute bottom-full left-0 w-full shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-2xl p-2 mb-2 z-50 backdrop-blur-xl border"
                            style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="w-full text-left px-4 py-3 font-medium rounded-xl transition-colors flex items-center space-x-3 disabled:opacity-50"
                                style={{ color: colors.error }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.error}15`}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {isDeleting ? <span>⏳</span> : <Icons.Trash size={20} color={colors.error} />}
                                <span>{isDeleting ? "Eliminando..." : "Eliminar cuenta"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* User & Sign Out */}
            <div className="mt-auto pt-6 border-t" style={{ borderColor: colors.border }}>
                <div
                    onClick={() => onTabChange("profile")}
                    className="flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all hover:shadow-md group"
                    style={{ backgroundColor: colors.bgSecondary }}
                >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden ring-2 ring-offset-2 transition-all group-hover:scale-105"
                        style={{ backgroundColor: colors.primaryLight, color: colors.primary, ringColor: colors.primary }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
                        ) : (
                            user?.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: colors.text }}>{user?.username}</p>
                        <p className="text-xs truncate" style={{ color: colors.textSecondary }}>@{user?.username}</p>
                    </div>
                    <div className="text-gray-400">
                        <Icons.MoreHorizontal size={16} />
                    </div>
                </div>

                <button
                    onClick={onSignOut}
                    className="w-full mt-3 text-center py-2 text-sm font-medium rounded-xl transition-all opacity-70 hover:opacity-100"
                    style={{ color: colors.textTertiary }}
                >
                    Cerrar sesión
                </button>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteAccount}
                title="¿Eliminar cuenta permanentemente?"
                message="Esta acción borrará todos tus posts, comentarios y likes. NO se puede deshacer. ¿Estás seguro?"
            />
        </div>
    );
}
