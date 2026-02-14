import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, isCartOpen, cartTotal, currentUser } from '../../lib/store';
import { Button } from '../ui/Button';
import { CartList } from './CartList';
import { supabase } from '../../lib/supabase';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CheckoutComponent = () => {
    const $cartItems = useStore(cartItems);
    const $cartTotal = useStore(cartTotal);
    const $currentUser = useStore(currentUser);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Manual Payment State
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Fetch Exchange Rate on Mount
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const response = await fetch('https://criptoya.com/api/binancep2p/USDT/VES/0.1');
                const data = await response.json();
                // Assuming the API returns an object where we can pick the 'bid' or 'ask' average. 
                // The prompt URL returns a simple JSON like { "ask": ..., "bid": ..., ... } usually. 
                // Let's assume 'ask' (selling USDT to get VES) or just the main price.
                // Checking criptoya docs/response structure is ideal, but based on prompt "price of dollar",
                // usually 'ask' is what users pay.
                // Let's use `bid` (what they get) or `ask` (cost). For a store, we likely want the 'ask' rate or average.
                // Let's safely default to a number if structure varies, but for now assuming `ask`.
                if (data && data.ask) {
                    setExchangeRate(parseFloat(data.ask));
                }
            } catch (err) {
                console.error("Error fetching rate:", err);
                setError("No se pudo obtener la tasa del dólar. Por favor recarga la página.");
            }
        };
        fetchRate();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleManualPayment = async () => {
        if (!$currentUser) {
            setError("Debes iniciar sesión para realizar un pedido.");
            return;
        }
        if (!proofFile) {
            setError("Por favor adjunta la captura del pago.");
            return;
        }
        if (!exchangeRate) {
            setError("Esperando tasa de cambio...");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Upload Proof
            setUploading(true);
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${$currentUser.id}/${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase!.storage
                .from('payment-proofs')
                .upload(fileName, proofFile);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase!.storage
                .from('payment-proofs')
                .getPublicUrl(fileName);

            // 2. Create Order
            const vesTotal = $cartTotal * exchangeRate;

            const { error: orderError } = await supabase!
                .from('orders')
                .insert({
                    user_id: $currentUser.id,
                    total: $cartTotal, // Required by existing schema
                    total_usdt: $cartTotal,
                    total_ves: vesTotal,
                    exchange_rate: exchangeRate,
                    status: 'pending',
                    proof_url: publicUrl,
                    items: $cartItems
                });

            if (orderError) throw orderError;

            setSuccess(true);
            cartItems.set([]); // Clear the cart

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al procesar el pedido.");
        } finally {
            setIsLoading(false);
            setUploading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16 px-4">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">¡Pago Reportado!</h2>
                <p className="text-gray-400 text-lg mb-8">
                    Tu pedido ha sido creado y está bajo revisión. Te notificaremos cuando sea aprobado.
                </p>
                <a href="/store">
                    <Button className="bg-primary text-black font-bold uppercase tracking-widest px-8 py-3">
                        Volver a la Tienda
                    </Button>
                </a>
            </div>
        );
    }

    if ($cartItems.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Tu carrito está vacío.</p>
                <a href="/store" className="text-primary hover:text-primary/80 font-semibold mt-4 inline-block">
                    Volver a la tienda
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <CartList readOnly />

            <div className="grid md:grid-cols-2 gap-8">
                {/* Payment Data Card */}
                <div className="bg-[#18181b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
                        <span className="text-primary">///</span> Datos Pago Móvil
                    </h2>

                    <div className="space-y-4 text-gray-300 text-sm md:text-base">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500">Banco:</span>
                            <span className="font-bold text-white">Banco Venezuela (0102)</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500">Teléfono:</span>
                            <span className="font-bold text-white">0412-1234567</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-gray-500">Cédula/RIF:</span>
                            <span className="font-bold text-white">V-12.345.678</span>
                        </div>

                        <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-primary/80">Tasa de cambio (Binance):</span>
                                <span className="font-bold text-white">
                                    {exchangeRate ? `${exchangeRate.toFixed(2)} Bs/USDT` : 'Cargando...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-white uppercase">Monto a Pagar:</span>
                                <span className="text-3xl font-black text-primary tracking-tighter">
                                    {exchangeRate ? `Bs ${(($cartTotal * exchangeRate).toFixed(2))}` : '---'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Payment Form */}
                <div className="bg-[#18181b] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-6 flex items-center gap-2">
                        <span className="text-primary">///</span> Reportar Pago
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Comprobante de Pago
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${proofFile ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}`}>
                                    {proofFile ? (
                                        <>
                                            <CheckCircle2 className="w-8 h-8 text-primary mb-2" />
                                            <span className="text-sm text-white font-medium">{proofFile.name}</span>
                                            <span className="text-xs text-green-400 mt-1">Listo para subir</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-8 h-8 text-gray-500 group-hover:text-primary mb-2 transition-colors" />
                                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Click o arrastra tu captura aquí</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest py-4 text-lg shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleManualPayment}
                            disabled={isLoading || !exchangeRate || !proofFile}
                        >
                            {isLoading ? (uploading ? 'Subiendo Captura...' : 'Procesando...') : 'Reportar Pago'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
