import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';

export const AuthComponent = () => {
    if (!supabase) return <div className="text-red-500">Error: Supabase no configurado</div>;

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
            <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'github']} // We can configure these later
                theme="light"
                localization={{
                    variables: {
                        sign_in: {
                            email_label: 'Correo electrónico',
                            password_label: 'Contraseña',
                            button_label: 'Iniciar sesión',
                            loading_button_label: 'Iniciando sesión...',
                            social_provider_text: 'Iniciar con {{provider}}',
                            link_text: '¿Ya tienes una cuenta? Inicia sesión'
                        },
                        sign_up: {
                            email_label: 'Correo electrónico',
                            password_label: 'Contraseña',
                            button_label: 'Registrarse',
                            loading_button_label: 'Registrando...',
                            social_provider_text: 'Registrarse con {{provider}}',
                            link_text: '¿No tienes una cuenta? Regístrate'
                        }
                    }
                }}
            />
        </div>
    );
};
