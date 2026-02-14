import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Lock, Loader2 } from 'lucide-react';

export const UpdatePasswordForm = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial check to see if we have a session (recovery link logs you in)
    useEffect(() => {
        supabase!.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError('Enlace inválido o expirado. Por favor solicita uno nuevo.');
            }
        });
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase!.auth.updateUser({
                password: password
            });

            if (error) throw error;
            setMessage('¡Contraseña actualizada exitosamente! Redirigiendo...');

            setTimeout(() => {
                window.location.href = '/';
            }, 2000);

        } catch (err: any) {
            setError(err.message || 'Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-[#18181b] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase text-center mb-6">
                Nueva Contraseña
            </h2>

            {message && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-3 rounded mb-4 text-center">
                    {message}
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase">Ingresa tu nueva contraseña</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !!message}
                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2"
                >
                    {loading && <Loader2 className="animate-spin" size={18} />}
                    Actualizar Contraseña
                </Button>
            </form>
        </div>
    );
};
