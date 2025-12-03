import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { listChats, getUserProfile, notificationsByReceiverID } from "../graphql/queries";
import { createChat } from "../graphql/mutations";
import { getUrl } from "@aws-amplify/storage";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";
import SearchBar from "./SearchBar";

const client = generateClient();

export default function ChatList({ currentUser, onSelectChat }) {
    const { colors } = useTheme();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avatars, setAvatars] = useState({});

    useEffect(() => {
        loadChats();
    }, [currentUser]);

    async function loadChats() {
        setLoading(true);
        try {
            // 1. List all chats
            const res = await client.graphql({
                query: listChats,
                variables: { limit: 1000 }
            });

            const allChats = res.data.listChats.items;
            const myChats = allChats.filter(c => c.participants.includes(currentUser.userId));

            // 2. Fetch unread message notifications
            const notifRes = await client.graphql({
                query: notificationsByReceiverID,
                variables: {
                    receiverID: currentUser.userId,
                    filter: {
                        type: { eq: "MESSAGE" },
                        isRead: { eq: false }
                    },
                    limit: 1000
                }
            });
            const unreadNotifs = notifRes.data.notificationsByReceiverID.items;

            // Count unread per sender
            const unreadMap = {};
            unreadNotifs.forEach(n => {
                unreadMap[n.senderID] = (unreadMap[n.senderID] || 0) + 1;
            });

            // 3. Enrich with other user info & unread count
            const enrichedChats = await Promise.all(myChats.map(async (chat) => {
                const otherUserId = chat.participants.find(p => p !== currentUser.userId) || currentUser.userId;

                try {
                    const userRes = await client.graphql({
                        query: getUserProfile,
                        variables: { id: otherUserId }
                    });
                    const otherUser = userRes.data.getUserProfile || { username: "Usuario desconocido", id: otherUserId };

                    // Load avatar
                    if (otherUser.avatar) {
                        getUrl({ key: otherUser.avatar })
                            .then(res => setAvatars(prev => ({ ...prev, [otherUserId]: res.url.toString() })))
                            .catch(e => console.warn("Error loading avatar:", e));
                    }

                    return {
                        ...chat,
                        otherUser,
                        unreadCount: unreadMap[otherUserId] || 0
                    };
                } catch (e) {
                    console.warn("Error fetching user for chat:", e);
                    return { ...chat, otherUser: { username: "Usuario", id: otherUserId }, unreadCount: 0 };
                }
            }));

            // Sort by updatedAt desc
            enrichedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            setChats(enrichedChats);
        } catch (err) {
            console.error("Error loading chats:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleStartChat(selectedUser) {
        // Check if chat already exists
        const existingChat = chats.find(c => c.participants.includes(selectedUser.id));
        if (existingChat) {
            onSelectChat(existingChat);
            return;
        }

        // Create new chat
        try {
            const res = await client.graphql({
                query: createChat,
                variables: {
                    input: {
                        participants: [currentUser.userId, selectedUser.id]
                    }
                }
            });
            const newChat = res.data.createChat;
            newChat.otherUser = selectedUser;
            newChat.unreadCount = 0;

            setChats(prev => [newChat, ...prev]);
            onSelectChat(newChat);
        } catch (err) {
            console.error("Error creating chat:", err);
            alert("Error al iniciar chat");
        }
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b sticky top-0 z-10 backdrop-blur-md"
                style={{ backgroundColor: `${colors.surface}CC`, borderColor: colors.border }}>
                <h2 className="text-xl font-bold mb-4" style={{ color: colors.text }}>Mensajes</h2>
                <SearchBar onSelectUser={handleStartChat} currentUser={currentUser} />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="text-center py-10 opacity-50" style={{ color: colors.textSecondary }}>
                        <Icons.MessageCircle size={48} className="mx-auto mb-2 opacity-20" />
                        <p>No tienes mensajes.</p>
                        <p className="text-sm">Busca a alguien para chatear.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => onSelectChat(chat)}
                                className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 text-left group relative"
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden shadow-sm relative"
                                    style={{ backgroundColor: colors.primaryLight, color: colors.primary }}>
                                    {avatars[chat.otherUser.id] ? (
                                        <img src={avatars[chat.otherUser.id]} alt={chat.otherUser.username} className="w-full h-full object-cover" />
                                    ) : (
                                        chat.otherUser.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className={`truncate ${chat.unreadCount > 0 ? 'font-extrabold' : 'font-bold'}`}
                                            style={{ color: colors.text }}>
                                            {chat.otherUser.username}
                                        </h3>
                                        <span className={`text-xs ${chat.unreadCount > 0 ? 'font-bold text-violet-600' : ''}`}
                                            style={{ color: chat.unreadCount > 0 ? colors.primary : colors.textSecondary }}>
                                            {new Date(chat.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'font-bold' : 'opacity-70'}`}
                                            style={{ color: chat.unreadCount > 0 ? colors.text : colors.textSecondary }}>
                                            {chat.unreadCount > 0 ? `${chat.unreadCount} mensajes nuevos` : "Abrir conversación..."}
                                        </p>
                                        {chat.unreadCount > 0 && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-violet-600 ml-2"></div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
