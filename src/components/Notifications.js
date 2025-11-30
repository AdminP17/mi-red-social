import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { onCreateLike, onCreateComment, onCreateFollow } from "../graphql/subscriptions";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient();

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        getCurrentUser().then(user => setCurrentUserId(user.userId)).catch(err => console.error("Error getting user:", err));
    }, []);

    useEffect(() => {
        if (!currentUserId) return;

        // Helper to add notification
        const addNotif = (msg, type) => {
            const id = Date.now();
            setNotifications(prev => [...prev, { id, msg, type }]);
            // Auto dismiss
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 6000);
        };

        // 1. Subscribe to Likes
        const likeSub = client.graphql({ query: onCreateLike }).subscribe({
            next: ({ data }) => {
                const like = data.onCreateLike;
                // Check if it's my post and not my own like
                if (like.post && like.post.userID === currentUserId && like.userID !== currentUserId) {
                    // Try to get username if available in nested selection, otherwise generic
                    const likerName = like.user?.username || "Alguien";
                    addNotif(`${likerName} le dio like a tu post ❤️`, "like");
                }
            },
            error: (err) => console.error("Subscription error (Like):", JSON.stringify(err, null, 2))
        });

        // 2. Subscribe to Comments
        const commentSub = client.graphql({ query: onCreateComment }).subscribe({
            next: ({ data }) => {
                const comment = data.onCreateComment;
                if (comment.post && comment.post.userID === currentUserId && comment.userID !== currentUserId) {
                    const commenterName = comment.user?.username || "Alguien";
                    addNotif(`${commenterName} comentó: "${comment.content.substring(0, 20)}..." 💬`, "comment");
                }
            },
            error: (err) => console.error("Subscription error (Comment):", JSON.stringify(err, null, 2))
        });

        // 3. Subscribe to Follows
        const followSub = client.graphql({ query: onCreateFollow }).subscribe({
            next: ({ data }) => {
                const follow = data.onCreateFollow;
                if (follow.followedID === currentUserId) {
                    const followerName = follow.follower?.username || "Alguien";
                    addNotif(`${followerName} comenzó a seguirte 👤`, "follow");
                }
            },
            error: (err) => console.error("Subscription error (Follow):", JSON.stringify(err, null, 2))
        });

        return () => {
            likeSub.unsubscribe();
            commentSub.unsubscribe();
            followSub.unsubscribe();
        };
    }, [currentUserId]);

    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className="bg-white border-l-4 border-blue-500 text-gray-800 px-4 py-3 rounded shadow-lg flex items-center min-w-[300px] pointer-events-auto animate-slide-in-right"
                >
                    <div className="flex-grow">
                        <p className="font-medium text-sm">{n.msg}</p>
                    </div>
                    <button
                        onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                        className="ml-3 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
