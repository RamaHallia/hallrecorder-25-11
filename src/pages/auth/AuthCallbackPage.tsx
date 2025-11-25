import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (!accessToken || !refreshToken) {
          throw new Error('Tokens manquants dans l\'URL');
        }

        if (type === 'recovery') {
          console.log('🔐 PASSWORD_RECOVERY détecté - redirection sans connexion');

          navigate(`/reset-password?token=${accessToken}`);
          return;
        }

        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) throw error;

        if (data.session) {
          console.log('✅ Session établie - redirection vers dashboard');
          navigate('/dashboard');
        } else {
          throw new Error('Impossible d\'établir la session');
        }
      } catch (err: any) {
        console.error('❌ Erreur callback:', err);
        setError(err.message || 'Erreur lors de l\'authentification');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200 text-center">
            <h2 className="text-2xl font-bold text-red-700 mb-4">Erreur d'authentification</h2>
            <p className="text-cocoa-600 mb-6">{error}</p>
            <p className="text-sm text-cocoa-500">Redirection vers la connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-coral-500 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cocoa-900 mb-2">Vérification...</h2>
        <p className="text-cocoa-600">Veuillez patienter</p>
      </div>
    </div>
  );
};
