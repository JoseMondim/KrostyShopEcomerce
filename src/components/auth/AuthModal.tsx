import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, Mail, Lock, User, Chrome, Facebook, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { setUser } from '../../lib/store';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);

    React.useEffect(() => {
        setMode(initialMode);
    }, [initialMode, isOpen]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null); // Success message
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { data, error } = await supabase!.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                    },
                });

                if (error) throw error;
                if (data.user) {
                    onClose();
                    alert('Registro exitoso! Por favor verifica tu correo si es necesario.');
                }
            } else if (mode === 'login') {
                const { data, error } = await supabase!.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) throw error;
                if (data.user) {
                    onClose();
                }
            } else if (mode === 'forgot_password') {
                const { error } = await supabase!.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: window.location.origin + '/update-password',
                });

                if (error) throw error;
                setMessage('¡Listo! Revisa tu correo para restablecer la contraseña.');
            }
        } catch (err: any) {
            if (err.message.includes('Email not confirmed')) {
                setError('Por favor verifica tu correo electrónico para poder ingresar.');
            } else {
                setError(err.message || 'Ocurrió un error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2">
                            {mode === 'login' ? 'Bienvenido de nuevo' : mode === 'signup' ? 'Crea tu cuenta' : 'Recuperar Contraseña'}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {mode === 'login'
                                ? 'Ingresa a tu cuenta para gestionar tus compras.'
                                : mode === 'signup'
                                    ? 'Regístrate para comprar gift cards al instante.'
                                    : 'Te enviaremos un enlace para crear una nueva contraseña.'}
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded text-sm mb-4">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-500 px-4 py-2 rounded text-sm mb-4">
                                {message}
                            </div>
                        )}

                        {mode === 'signup' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Tu nombre completo"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {mode !== 'forgot_password' && (
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-primary focus:outline-none transition-colors"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot_password')}
                                    className="text-xs text-primary hover:text-primary/80"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest py-3 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {mode === 'login' ? 'Ingresar' : mode === 'signup' ? 'Registrarse' : 'Enviar enlace'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            {mode === 'login' ? '¿No tienes cuenta?' : mode === 'signup' ? '¿Ya tienes cuenta?' : '¿Ya tienes cuenta?'}
                            {' '}
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-primary font-bold hover:underline"
                            >
                                {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
