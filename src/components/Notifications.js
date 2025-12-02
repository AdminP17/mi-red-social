import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { onCreateNotification, deleteNotification } from "../graphql/subscriptions";
import { deleteNotification as deleteNotificationMutation, updateNotification } from "../graphql/mutations";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "@aws-amplify/storage";

const client = generateClient();

export default function Notifications({ onPostClick, onUserClick }) {
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
                  nextToken
                }
              }
            `;

            const res = await client.graphql({
                query: notificationsByReceiverIDWithSender,
                variables: {
                    receiverID: currentUserId,
                }
            });

            const items = res.data.notificationsByReceiverID.items;

            // Enrich with avatars
            const itemsWithAvatars = await Promise.all(items.map(async (n) => {
                if (n.sender && n.sender.avatar) {
                    try {
                        const urlResult = await getUrl({ key: n.sender.avatar });
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
        return <div className="text-center py-10 text-gray-500">Cargando notificaciones...</div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
                <p>No tienes notificaciones nuevas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {notifications.map(n => (
                <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`bg-white border-l-4 ${n.type === 'LIKE' ? 'border-red-400' : n.type === 'COMMENT' ? 'border-blue-400' : 'border-green-400'} p-4 rounded shadow-sm hover:shadow-md transition flex items-start justify-between cursor-pointer ${!n.isRead ? 'bg-blue-50' : ''}`}
                >
                    <div className="flex items-center space-x-3">
                        {/* Icon based on type */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${n.type === 'LIKE' ? 'bg-red-100 text-red-500' : n.type === 'COMMENT' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                            {n.sender?.avatarUrl ? (
                                <img src={n.sender.avatarUrl} alt={n.sender.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                n.type === 'LIKE' ? '❤️' : n.type === 'COMMENT' ? '💬' : '👤'
                            )}
                        </div>

                        <div>
                            <p className="text-gray-800 text-sm">
                                <span className="font-bold">@{n.sender?.username || "Usuario"}</span> {n.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Borrar"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
