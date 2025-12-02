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
    followsByFollowedID,
    notificationsByReceiverID
} from "../graphql/queries";
import { onCreateNotification, onUpdateNotification } from "../graphql/subscriptions";
import ConfirmationModal from "./ConfirmationModal";

const client = generateClient();

export default function Sidebar({ user, activeTab, onTabChange, onSignOut }) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const menuItems = [
        { id: "home", icon: "🏠", label: "Inicio", badge: 0 },
        { id: "notifications", icon: "🔔", label: "Notificaciones", badge: unreadCount },
        { id: "profile", icon: "👤", label: "Perfil", badge: 0 }
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

    // Fetch Unread Notifications Count
    useEffect(() => {
        if (!user?.userId) return;

        const fetchUnread = async () => {
            try {
                // In a real app, we would filter by isRead: false
                // But for now, let's just count all notifications as a demo or assume we want to show total count
                // Or better, let's filter client side if API doesn't support complex filter on non-indexed field easily without setup
                // Schema has isRead, but we might not have an index on it combined with receiverID.
                // Let's just fetch latest 100 and count unread.
                const res = await client.graphql({
                    query: notificationsByReceiverID,
                    variables: {
                        receiverID: user.userId,
                        limit: 100
                    }
                });
                const items = res.data.notificationsByReceiverID.items;
                const unread = items.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (e) {
                console.error("Error fetching unread count:", e);
            }
        };

        fetchUnread();
    }, [user]);

    // Subscribe to increment count (create) and decrement (update)
    useEffect(() => {
        if (!user?.userId) return;

        // Create subscription
        const createSub = client.graphql({
            query: onCreateNotification,
            variables: { filter: { receiverID: { eq: user.userId } } }
        }).subscribe({
            next: () => {
                setUnreadCount(prev => prev + 1);
            },
            error: err => console.error("Notif create subscription error:", err)
        });

        // Update subscription (for mark as read)
        // Note: We need to import onUpdateNotification
        const updateSub = client.graphql({
            query: onUpdateNotification,
            variables: { filter: { receiverID: { eq: user.userId } } }
        }).subscribe({
            next: ({ data }) => {
                const updated = data.onUpdateNotification;
                if (updated.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            },
            error: err => console.error("Notif update subscription error:", err)
        });

        return () => {
            createSub.unsubscribe();
            updateSub.unsubscribe();
        };
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
        <div className="w-64 bg-white h-screen sticky top-0 border-r border-gray-200 flex flex-col p-4 hidden md:flex">
            {/* Logo */}
            <div className="mb-8 px-4">
                <h1 className="text-3xl font-bold text-blue-600">P17</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 relative">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl transition-colors relative ${activeTab === item.id
                            ? "font-bold text-gray-900"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                        {item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full absolute left-8 top-2 border-2 border-white">
                                {item.badge > 99 ? "99+" : item.badge}
                            </span>
                        )}
                    </button>
                ))}

                <div className="relative">
                    <button
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <span>⭕</span>
                        <span>Más</span>
                    </button>

                    {/* More Menu Dropdown */}
                    {showMoreMenu && (
                        <div className="absolute bottom-full left-0 w-full bg-white shadow-xl rounded-xl border border-gray-100 p-2 mb-2 z-50">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                <span>{isDeleting ? "⏳" : "🗑️"}</span>
                                <span>{isDeleting ? "Eliminando..." : "Eliminar cuenta"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* User & Sign Out */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                <div
                    onClick={() => onTabChange("profile")}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors mb-2"
                >
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 overflow-hidden">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={user?.username} className="w-full h-full object-cover" />
                        ) : (
                            user?.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user?.username}</p>
                        <p className="text-gray-500 text-xs truncate">@{user?.username}</p>
                    </div>
                </div>

                <button
                    onClick={onSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
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
