import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface Message {
    id: string;
    order_id: string;
    user_id: string;
    content: string;
    created_at: string;
}

interface ChatComponentProps {
    orderId: string;
    currentUserId: string;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ orderId, currentUserId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase!
                .from('messages')
                .select('*')
                .eq('order_id', orderId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
            setLoading(false);
        };

        fetchMessages();

        const channel = supabase!
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `order_id=eq.${orderId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase!.removeChannel(channel);
        };
    }, [orderId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const { error } = await supabase!
            .from('messages')
            .insert({
                order_id: orderId,
                user_id: currentUserId,
                content: newMessage,
            });

        if (error) {
            console.error('Error sending message:', error);
        } else {
            setNewMessage('');
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Cargando chat...</div>;

    return (
        <div className="flex flex-col h-[600px] bg-[#1a1a1d] rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/5 bg-[#18181b] rounded-t-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">Chat del Pedido</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                        No hay mensajes aún. ¡Inicia la conversación!
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.user_id === currentUserId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                    ? 'bg-primary text-black font-medium rounded-tr-none'
                                    : 'bg-white/10 text-white rounded-tl-none'
                                    }`}
                            >
                                <p>{msg.content}</p>
                                <span className={`text-[10px] block mt-1 ${isMe ? 'text-black/60' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#18181b] rounded-b-xl flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
                <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-black p-2 rounded-lg"
                    disabled={!newMessage.trim()}
                >
                    <Send className="w-5 h-5" />
                </Button>
            </form>
        </div>
    );
};
