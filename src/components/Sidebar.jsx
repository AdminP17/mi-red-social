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

const client = generateClient();

export default function Sidebar({ user, activeTab, onTabChange, onSignOut }) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user?.avatar) {
            getUrl({ key: user.avatar })
                .then(res => setAvatarUrl(res.url.toString()))
                .catch(err => console.error("Error loading sidebar avatar:", err));
        } else {
            setAvatarUrl(null);
        }
    }, [user]);

    const menuItems = [
        { id: "home", label: "Inicio", icon: "🏠" },
        { id: "notifications", label: "Notificaciones", icon: "🔔" },
        { id: "messages", label: "Mensajes", icon: "✉️" },
        { id: "profile", label: "Perfil", icon: "👤" },
    ];

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
                        className={`w-full flex items-center space-x-4 px-4 py-3 rounded-full text-xl transition-colors ${activeTab === item.id
                            ? "font-bold text-gray-900"
                            : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
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
