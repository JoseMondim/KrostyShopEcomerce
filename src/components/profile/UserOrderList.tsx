import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useStore } from '@nanostores/react';
import { currentUser } from '../../lib/store';
import { Button } from '../ui/Button';
import { ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const UserOrderList = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const $currentUser = useStore(currentUser);

    useEffect(() => {
        if (!$currentUser) return;

        const fetchOrders = async () => {
            const { data, error } = await supabase!
                .from('orders')
                .select('*')
                .eq('user_id', $currentUser.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        };

        fetchOrders();
    }, [$currentUser]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
            case 'approved':
                return <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Aprobado</span>;
            case 'rejected':
                return <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><XCircle className="w-3 h-3" /> Rechazado</span>;
            default:
                return <span className="text-gray-500">{status}</span>;
        }
    };

    if (loading) return <div className="text-white text-center py-8">Cargando tus órdenes...</div>;
    if (!$currentUser) return <div className="text-center text-white">Inicia sesión para ver tus órdenes.</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Mis Pedidos</h2>

            <div className="grid gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-[#18181b] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/30 transition-colors">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-500 text-xs font-mono">
                                    #{order.display_id ? order.display_id : order.id.slice(0, 8)}
                                </span>
                                {getStatusBadge(order.status)}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-white font-bold text-lg">${order.total_usdt} USDT</span>
                                <span className="text-gray-500 text-sm">/ {Number(order.total_ves).toFixed(1)} Bs</span>
                            </div>
                            <p className="text-gray-400 text-xs">
                                {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>

                        <a href={`/profile/orders/${order.id}`}>
                            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 group">
                                Ver Detalles <ExternalLink className="w-4 h-4 ml-2 group-hover:text-primary transition-colors" />
                            </Button>
                        </a>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-16 text-gray-500 bg-[#18181b] rounded-xl border border-white/5">
                        <p>No has realizado ningún pedido aún.</p>
                        <a href="/store" className="text-primary hover:underline mt-2 inline-block">Ir a la tienda</a>
                    </div>
                )}
            </div>
        </div>
    );
};
