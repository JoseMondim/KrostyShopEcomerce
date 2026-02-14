import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '@nanostores/react';
import { currentUser } from '../../lib/store';
import { ChatComponent } from '../chat/ChatComponent';
import { CheckCircle2, XCircle, ArrowLeft, Clock } from 'lucide-react';

interface OrderDetailProps {
    orderId: string;
}

export const UserOrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const $currentUser = useStore(currentUser);

    useEffect(() => {
        if (!$currentUser) return;

        const fetchOrder = async () => {
            const { data, error } = await supabase!
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (data) setOrder(data);
            setLoading(false);
        };

        fetchOrder();
    }, [orderId, $currentUser]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente: Estamos verificando tu pago</span>;
            case 'approved':
                return <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Aprobado: Tu pedido ha sido procesado</span>;
            case 'rejected':
                return <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3" /> Rechazado: Hubo un problema con tu pago</span>;
            default:
                return <span className="text-gray-500">{status}</span>;
        }
    };

    if (loading) return <div className="text-white">Cargando detalles...</div>;
    if (!order) return <div className="text-red-500">Orden no encontrada o no tienes permiso para verla.</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <a href="/profile" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis pedidos
            </a>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Orden #{order.display_id ? order.display_id : order.id.slice(0, 8)}
                                </h1>
                                <p className="text-gray-400">Creada el {new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            {getStatusBadge(order.status)}
                        </div>

                        <div className="text-right border-t border-white/10 pt-6">
                            <p className="text-3xl font-black text-primary">${order.total_usdt} USDT</p>
                            <p className="text-gray-400 text-sm">Pagaste: {Number(order.total_ves).toFixed(1)} Bs</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Tu Compra</h2>
                        <div className="space-y-4">
                            {order.items && order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-white/5" />
                                    <div>
                                        <p className="font-bold text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
                                    </div>
                                    <div className="ml-auto font-bold text-white">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Chat */}
                <div className="lg:col-span-1">
                    {/* Chat Component */}
                    <div className="sticky top-8">
                        {$currentUser && (
                            <ChatComponent orderId={orderId} currentUserId={$currentUser.id} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
