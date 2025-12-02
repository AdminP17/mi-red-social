import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Icons } from './Icons';

export default function MessageInput({ onSendMessage, loading }) {
    const { colors } = useTheme();
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !loading) {
            onSendMessage(message);
            setMessage("");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t" style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2"
                    style={{
                        backgroundColor: colors.bgSecondary,
                        color: colors.text,
                        borderColor: colors.border,
                    }}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || loading}
                    className="p-2 rounded-full transition-colors disabled:opacity-50"
                    style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
                >
                    <Icons.Send size={20} />
                </button>
            </div>
        </form>
    );
}
