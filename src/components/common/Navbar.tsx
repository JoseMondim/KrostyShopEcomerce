import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, currentUser, setUser } from '../../lib/store';
import { ShoppingBag, Search, Menu, X, Instagram, Facebook, Youtube, MessageCircle, User as UserIcon, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import krostyLogo from '../../assets/images/krostylogo.png';
import { AuthModal } from '../auth/AuthModal';
import { supabase } from '../../lib/supabase';

export const Navbar = () => {
    const $cartItems = useStore(cartItems);
    const $currentUser = useStore(currentUser);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check initial session
        supabase?.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            checkAdminRole(user?.id);
        });

        // Listen for changes
        const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            checkAdminRole(session?.user?.id);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkAdminRole = async (userId: string | undefined) => {
        if (!userId) {
            setIsAdmin(false);
            return;
        }
        const { data } = await supabase!
            .from('profiles')
            .select('role')
            .select('role')
            .eq('id', userId)
            .maybeSingle();

        setIsAdmin(data?.role === 'admin');
    };

    const handleLogout = async () => {
        await supabase!.auth.signOut();
        setUser(null);
        setIsAdmin(false);
    };

    const cartCount = $cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const openAuth = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setIsAuthOpen(true);
        setIsMenuOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/5">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex justify-between items-center h-20">

                        {/* Left: Logo & Badges */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#3b82f6] text-white text-xs font-bold px-2 py-0.5 rounded-sm">Bs.D.</span>
                                <a href="/" className="flex-shrink-0">
                                    <img src={krostyLogo.src} alt="Krosty Shop" className="h-10 w-auto" />
                                </a>
                            </div>

                            {/* Desktop Nav Links */}
                            <div className="hidden lg:flex items-center space-x-6 text-sm font-medium tracking-wide">
                                <a href="/" className="text-gray-300 hover:text-white transition-colors uppercase text-xs">Inicio</a>
                                <a href="/store" className="text-gray-300 hover:text-white transition-colors uppercase text-xs">Catálogo</a>
                            </div>
                        </div>

                        {/* Right: Socials, Search, Account, Cart */}
                        <div className="hidden lg:flex items-center space-x-6">
                            {/* Socials */}
                            <div className="flex items-center space-x-4 border-r border-white/10 pr-6">
                                <a href="https://www.instagram.com/krostyshop?igsh=dHA3d3I3MWs5eDZk&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E4405F] transition-colors"><Instagram size={20} /></a>
                            </div>

                            {/* Search */}


                            {/* Account Buttons */}
                            <div className="flex items-center">
                                {$currentUser ? (
                                    <div className="flex items-center gap-4">
                                        {/* Admin Link */}
                                        {isAdmin && (
                                            <a href="/admin" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1" title="Panel Admin">
                                                <ShieldCheck size={18} />
                                                <span className="text-xs font-bold uppercase hidden xl:block">Admin</span>
                                            </a>
                                        )}

                                        {/* Profile Link */}
                                        <a href="/profile" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1" title="Mi Perfil">
                                            <UserCircle size={18} />
                                            <span className="text-xs font-bold uppercase hidden xl:block">Mi Perfil</span>
                                        </a>

                                        <div className="flex items-center gap-2 text-white border-l border-white/10 pl-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/50">
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="text-sm font-medium hidden xl:block">
                                                {$currentUser.user_metadata?.full_name || $currentUser.email?.split('@')[0]}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="text-gray-400 hover:text-red-500 transition-colors bg-transparent p-2 rounded-full hover:bg-white/5"
                                            title="Cerrar Sesión"
                                        >
                                            <LogOut size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openAuth('signup')}
                                            className="bg-primary hover:bg-primary/90 text-black font-bold text-xs px-4 py-2 rounded-l-full uppercase transition-colors"
                                        >
                                            Crear Cuenta
                                        </button>
                                        <button
                                            onClick={() => openAuth('login')}
                                            className="bg-transparent border border-white/20 hover:border-white/50 text-white font-bold text-xs px-4 py-2 rounded-r-full uppercase -ml-px transition-colors"
                                        >
                                            Ingresar
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Cart */}
                            <a href="/cart" className="relative text-gray-300 hover:text-white group">
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="lg:hidden p-2 text-gray-300 hover:text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-[#0a0a0a] border-b border-white/10">
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <a href="/" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Inicio</a>
                            <a href="/store" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-md">Catálogo</a>

                            <div className="pt-4 flex flex-col gap-3">
                                {$currentUser ? (
                                    <div className="space-y-3">
                                        {isAdmin && (
                                            <a href="/admin" className="block px-3 py-2 text-base font-medium text-primary hover:bg-white/5 rounded-md flex items-center gap-2">
                                                <ShieldCheck size={18} /> Panel Admin
                                            </a>
                                        )}
                                        <a href="/profile" className="block px-3 py-2 text-base font-medium text-white hover:bg-white/5 rounded-md flex items-center gap-2">
                                            <UserCircle size={18} /> Mi Perfil
                                        </a>

                                        <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <UserIcon size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">
                                                    {$currentUser.user_metadata?.full_name || 'Usuario'}
                                                </span>
                                                <span className="text-xs text-gray-400 truncate w-32">
                                                    {$currentUser.email}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-4 py-2 rounded-lg uppercase flex items-center justify-center gap-2 transition-colors border border-red-500/20"
                                        >
                                            <LogOut size={16} />
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openAuth('signup')}
                                            className="w-full bg-primary text-black font-bold px-4 py-2 rounded-full uppercase"
                                        >
                                            Crear Cuenta
                                        </button>
                                        <button
                                            onClick={() => openAuth('login')}
                                            className="w-full bg-white/10 text-white font-bold px-4 py-2 rounded-full uppercase"
                                        >
                                            Ingresar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};
