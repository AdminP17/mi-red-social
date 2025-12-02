import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { onCreateNotification, deleteNotification } from "../graphql/subscriptions";
import { deleteNotification as deleteNotificationMutation, updateNotification } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "@aws-amplify/storage";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function Notifications({ onPostClick, onUserClick }) {
    const { colors } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then(user => setCurrentUserId(user.userId)).catch(err => console.error("Error getting user:", err));
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        loadNotifications();

        // Subscribe to new notifications
        const subscription = client.graphql({
            query: onCreateNotification,
            variables: { filter: { receiverID: { eq: currentUserId } } }
        }).subscribe({
            next: ({ data }) => {
                const newNotif = data.onCreateNotification;
                // Add to top of list
                setNotifications(prev => [newNotif, ...prev]);
            },
            error: (err) => console.error("Subscription error:", err)
        });

        return () => subscription.unsubscribe();
    }, [currentUserId]);

    async function loadNotifications() {
        setLoading(true);
        try {
            // Custom query to fetch sender details
            const notificationsByReceiverIDWithSender = /* GraphQL */ `
              query NotificationsByReceiverID(
                $receiverID: ID!
                $limit: Int
                $nextToken: String
              ) {
                notificationsByReceiverID(
                  receiverID: $receiverID
                  limit: $limit
                  nextToken: $nextToken
                ) {
                  items {
                    id
                    type
                    content
                    isRead
                    senderID
                    receiverID
                    postID
                    createdAt
                    sender {
                      id
                      username
                      avatar
                    }
                  }
                }
              }
            `;

            const result = await client.graphql({
                query: notificationsByReceiverIDWithSender,
                variables: { receiverID: currentUserId }
            });

            const items = result.data.notificationsByReceiverID.items;

            const itemsWithAvatars = await Promise.all(items.map(async n => {
                if (n.sender && n.sender.avatar) {
                    try {
                        const urlResult = await getUrl({
                            path: n.sender.avatar,
                            options: { validateObjectExistence: false }
                        });
                        n.sender.avatarUrl = urlResult.url.toString();
                    } catch (e) {
                        console.warn("Error loading avatar for notification:", e);
                    }
                }
                return n;
            }));

            setNotifications(itemsWithAvatars);

        } catch (err) {
            console.error("Error loading notifications:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(e, id) {
        e.stopPropagation(); // Prevent triggering the click on the notification
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        try {
            await client.graphql({
                query: deleteNotificationMutation,
                variables: { input: { id } }
            });
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    }

    async function handleNotificationClick(n) {
        // Mark as read if not already read
        if (!n.isRead) {
            try {
                // Optimistic update
                setNotifications(prev => prev.map(item =>
                    item.id === n.id ? { ...item, isRead: true } : item
                ));

                await client.graphql({
                    query: updateNotification,
                    variables: { input: { id: n.id, isRead: true } }
                });
            } catch (err) {
                console.error("Error marking notification as read:", err);
            }
        }

        if (n.type === 'FOLLOW') {
            if (onUserClick && n.sender) {
                onUserClick(n.sender);
            }
        } else if (n.type === 'LIKE' || n.type === 'COMMENT') {
            if (onPostClick && n.postID) {
                onPostClick(n.postID);
            }
        }
    }

    if (loading && notifications.length === 0) {
        return <div className="text-center py-10" style={{ color: colors.textSecondary }}>Cargando notificaciones...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12 rounded-xl border border-dashed" style={{ borderColor: colors.border }}>
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icons.Bell size={32} className="text-slate-400" />
                </div>
                <h3 className="font-bold mb-1" style={{ color: colors.text }}>Sin notificaciones</h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>Te avisaremos cuando haya actividad.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notifications.map(n => (
                <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-800`}
                    style={{
                        backgroundColor: n.isRead ? 'transparent' : colors.bgSecondary
                    }}
                >
                    <div className="flex items-center space-x-4">
                        {/* Icon based on type */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgSecondary }}>
                                {n.sender?.avatarUrl ? (
                                    <img src={n.sender.avatarUrl} alt={n.sender.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-lg" style={{ color: colors.textSecondary }}>
                                        {n.sender?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className={`absolute - bottom - 1 - right - 1 w - 6 h - 6 rounded - full flex items - center justify - center border - 2 border - white dark: border - slate - 900 ${n.type === 'LIKE' ? 'bg-red-500' : n.type === 'COMMENT' ? 'bg-blue-500' : 'bg-violet-500'} `}>
                                {n.type === 'LIKE' ? <Icons.Heart size={12} className="text-white fill-current" /> : n.type === 'COMMENT' ? <Icons.MessageCircle size={12} className="text-white" /> : <Icons.User size={12} className="text-white" />}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm" style={{ color: colors.text }}>
                                <span className="font-bold">@{n.sender?.username || "Usuario"}</span>
                                <span className="ml-1">
                                    {n.type === 'LIKE' && "le gustó tu publicación"}
                                    {n.type === 'COMMENT' && "comentó en tu publicación"}
                                    {n.type === 'FOLLOW' && "comenzó a seguirte"}
                                </span>
                            </p>
                            {n.content && n.type === 'COMMENT' && (
                                <p className="text-sm mt-1 line-clamp-2" style={{ color: colors.textSecondary }}>"{n.content}"</p>
                            )}
                            <p className="text-xs mt-1 font-medium" style={{ color: colors.textTertiary }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="text-slate-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                        title="Borrar"
                    >
                        <Icons.X size={16} />
                    </button>
                </div >
            ))
            }
        </div >
    );
}
