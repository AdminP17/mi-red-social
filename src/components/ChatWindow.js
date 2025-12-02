import React, { useEffect, useState, useRef } from "react";
import { generateClient } from "aws-amplify/api";
import { messagesByChatIDAndCreatedAt, notificationsBySenderID } from "../graphql/queries";
import { createMessage, createNotification, updateNotification } from "../graphql/mutations";
import { onCreateMessage } from "../graphql/subscriptions";
import { getUrl } from "@aws-amplify/storage";
import MessageInput from "./MessageInput";
import { useTheme } from "../context/ThemeContext";
import { Icons } from "./Icons";

const client = generateClient();

export default function ChatWindow({ chat, currentUser, onBack }) {
    const { colors: themeColors } = useTheme();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const [otherUserAvatar, setOtherUserAvatar] = useState(null);

    const otherUser = chat.otherUser;

    useEffect(() => {
        if (otherUser?.avatar) {
            getUrl({ key: otherUser.avatar })
                .then(res => setOtherUserAvatar(res.url.toString()))
                .catch(e => console.warn("Error loading chat avatar:", e));
        }
    }, [otherUser]);

    useEffect(() => {
        loadMessages();
    }, [chat.id]);

    useEffect(() => {
        const subscription = client
            .graphql({
                query: onCreateMessage,
                variables: { filter: { chatID: { eq: chat.id } } }
            })
            .subscribe({
                next: ({ data }) => {
                    const newMsg = data.onCreateMessage;
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    scrollToBottom();
                },
                error: (err) => console.error("Message subscription error:", err),
            });

        return () => subscription.unsubscribe();
    }, [chat.id]);

    // Mark messages as read when chat opens
    useEffect(() => {
        const markAsRead = async () => {
            try {
                const res = await client.graphql({
                    query: notificationsBySenderID,
                    variables: {
                        senderID: chat.otherUser.id,
                        filter: {
                            receiverID: { eq: currentUser.userId },
                            type: { eq: "MESSAGE" },
                            isRead: { eq: false }
                        }
                    }
                });

                const unreadNotifs = res.data.notificationsBySenderID.items;

                await Promise.all(unreadNotifs.map(n =>
                    client.graphql({
                        query: updateNotification,
                        variables: { input: { id: n.id, isRead: true } }
                    })
                ));
            } catch (e) {
                console.warn("Error marking messages as read:", e);
            }
        };

        markAsRead();
    }, [chat.id, currentUser.userId, chat.otherUser.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    async function loadMessages() {
        setLoading(true);
        try {
            const res = await client.graphql({
                query: messagesByChatIDAndCreatedAt,
                variables: {
                    chatID: chat.id,
                    sortDirection: "ASC",
                    limit: 100
                }
            });
            setMessages(res.data.messagesByChatIDAndCreatedAt.items);
            setTimeout(scrollToBottom, 100);
        } catch (err) {
            console.error("Error loading messages:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage(content) {
        setSending(true);
        try {
            // 1. Create Message
            await client.graphql({
                query: createMessage,
                variables: {
                    input: {
                        chatID: chat.id,
                        content,
                        senderID: currentUser.userId
                    }
                }
            });

            // 2. Create Notification for Receiver
            // Custom mutation to avoid fetching 'post' fields which causes errors when postID is null
            const createMessageNotification = /* GraphQL */ `
              mutation CreateMessageNotification(
                $input: CreateNotificationInput!
              ) {
                createNotification(input: $input) {
                  id
                  type
                  content
                  senderID
                  receiverID
                  createdAt
                }
              }
            `;

            await client.graphql({
                query: createMessageNotification,
                variables: {
                    input: {
                        type: "MESSAGE",
                        content: "Te envió un mensaje",
                        senderID: currentUser.userId,
                        receiverID: chat.otherUser.id,
                        isRead: false
                    }
                }
            });

        } catch (err) {
            console.error("Error sending message:", err);
            alert("Error al enviar mensaje");
        } finally {
            setSending(false);
        }
    }

    if (!themeColors) return null;

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: themeColors.bg }}>
            {/* Header */}
            <div className="p-4 border-b flex items-center space-x-3 sticky top-0 z-10 backdrop-blur-md"
                style={{ backgroundColor: `${themeColors.surface}CC`, borderColor: themeColors.border }}>
                <button onClick={onBack} className="md:hidden p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: themeColors.text }}>
                    <Icons.ArrowLeft size={20} />
                </button>

                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden"
                    style={{ backgroundColor: themeColors.primaryLight, color: themeColors.primary }}>
                    {otherUserAvatar ? (
                        <img src={otherUserAvatar} alt={otherUser.username} className="w-full h-full object-cover" />
                    ) : (
                        otherUser.username.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h3 className="font-bold" style={{ color: themeColors.text }}>{otherUser.username}</h3>
                    <p className="text-xs" style={{ color: themeColors.textSecondary }}>@{otherUser.username}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-10 opacity-50" style={{ color: themeColors.textSecondary }}>
                        <p>No hay mensajes aún.</p>
                        <p className="text-sm">¡Di hola!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderID === currentUser.userId;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                                    style={{
                                        backgroundColor: isMe ? themeColors.primary : themeColors.bgSecondary,
                                        color: isMe ? '#FFFFFF' : themeColors.text
                                    }}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'opacity-50'}`}
                                        style={{ color: isMe ? 'rgba(255,255,255,0.7)' : themeColors.textSecondary }}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSendMessage={handleSendMessage} loading={sending} />
        </div>
    );
}
