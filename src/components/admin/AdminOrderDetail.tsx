import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '@nanostores/react';
import { currentUser } from '../../lib/store';
import { Button } from '../ui/Button';
import { ChatComponent } from '../chat/ChatComponent';
import { CheckCircle2, XCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface OrderDetailProps {
    orderId: string;
}

export const AdminOrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const $currentUser = useStore(currentUser);

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
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
    }, [orderId]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        const { error } = await supabase!
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar la orden. Revisa la consola o tus permisos de Admin.');
        } else {
            setOrder((prev: any) => ({ ...prev, status: newStatus }));
            alert(`Orden ${newStatus === 'approved' ? 'Aprobada' : 'Rechazada'} correctamente.`);
        }
        setUpdating(false);
    };

    if (loading) return <div className="text-white">Cargando detalles...</div>;
    if (!order) return <div className="text-red-500">Orden no encontrada</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <a href="/admin" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel
            </a>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Order Details & Proof */}
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
                            <div className="text-right">
                                <p className="text-3xl font-black text-primary">${order.total_usdt} USDT</p>
                                <p className="text-gray-400 text-sm">{Number(order.total_ves).toFixed(1)} Bs (Tasa: {order.exchange_rate})</p>
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-white/10 pt-6">
                            <Button
                                onClick={() => updateStatus('approved')}
                                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
                                disabled={order.status === 'approved' || updating}
                            >
                                <CheckCircle2 className="w-4 h-4" /> {updating ? 'Procesando...' : 'Aprobar Pago'}
                            </Button>
                            <Button
                                onClick={() => updateStatus('rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                                disabled={order.status === 'rejected' || updating}
                            >
                                <XCircle className="w-4 h-4" /> {updating ? 'Procesando...' : 'Rechazar Pago'}
                            </Button>
                        </div>
                    </div>

                    {/* Payment Proof */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Comprobante de Pago</h2>
                        {order.proof_url ? (
                            <div className="rounded-lg overflow-hidden border border-white/5 bg-black/50">
                                <a href={order.proof_url} target="_blank" rel="noopener noreferrer">
                                    <img src={order.proof_url} alt="Comprobante" className="w-full h-auto max-h-[600px] object-contain" />
                                </a>
                            </div>
                        ) : (
                            <p className="text-gray-500">No se adjuntó comprobante.</p>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#18181b] border border-white/10 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-white mb-6">Items del Pedido</h2>
                        <div className="space-y-4">
                            {order.items && order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded bg-white/5" />
                                    <div>
                                        <p className="font-bold text-white">{item.name}</p>
                                        <p className="text-sm text-gray-500">Cant: {item.quantity} x ${item.price}</p>
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
