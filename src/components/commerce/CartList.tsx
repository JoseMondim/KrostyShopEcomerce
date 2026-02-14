import { useStore } from '@nanostores/react';
import { cartItems, removeCartItem, currentUser } from '../../lib/store';
import { Button } from '../ui/Button';
import { Trash2 } from 'lucide-react';

interface CartListProps {
    readOnly?: boolean;
}

export const CartList: React.FC<CartListProps> = ({ readOnly = false }) => {
    const $cartItems = useStore(cartItems);
    const $currentUser = useStore(currentUser);
    const total = $cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if ($cartItems.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-10 h-10 text-gray-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h2>
                <p className="text-gray-400 mb-8">Parece que aún no has agregado nada.</p>
                <a href="/store">
                    <Button className="bg-primary text-black font-bold uppercase tracking-widest px-8 py-3 hover:bg-primary/90">
                        Ir a la Tienda
                    </Button>
                </a>
            </div>
        );
    }

    return (
        <div className="bg-[#18181b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide mb-8 flex items-center gap-3">
                <span className="text-primary">///</span> {readOnly ? 'Resumen del Pedido' : 'Tu Carrito'}
            </h1>

            <div className="space-y-6">
                {$cartItems.map((item) => (
                    <div key={item.id} className="group flex flex-col sm:flex-row justify-between items-center gap-6 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-20 h-24 bg-black/50 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg uppercase tracking-tight">{item.name}</h3>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1">Cantidad: {item.quantity}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                            <span className="font-black text-xl text-white tracking-tight">${(item.price * item.quantity).toFixed(2)}</span>
                            {!readOnly && (
                                <button
                                    onClick={() => removeCartItem(item.id)}
                                    className="text-gray-500 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
                                    aria-label="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-8">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</span>
                    <span className="text-4xl font-black text-white tracking-tighter">${total.toFixed(2)}</span>
                </div>

                {!readOnly && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <a href="/store" className="w-full sm:w-auto order-2 sm:order-1">
                            <Button variant="secondary" className="w-full bg-white/5 text-white hover:bg-white/10 border-white/10 font-bold uppercase tracking-widest py-4">
                                Seguir comprando
                            </Button>
                        </a>
                        <a href={!$currentUser ? "#" : "/checkout"} className="w-full sm:w-auto order-1 sm:order-2">
                            <Button
                                className="w-full bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest py-4 px-8 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!$currentUser}
                                onClick={(e) => {
                                    if (!$currentUser) {
                                        e.preventDefault();
                                        const event = new CustomEvent('open-auth-modal');
                                        window.dispatchEvent(event);
                                        // Optional: Show toast "Inicia sesión para comprar"
                                    }
                                }}
                            >
                                {$currentUser ? 'Proceder al Pago' : 'Inicia Sesión para Pagar'}
                            </Button>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};
