import { useState } from 'react';
import { Mail, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export const ForgotPasswordModal = ({ onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('🔐 Envoi de l\'email de réinitialisation pour:', email);
      console.log('🔐 URL de redirection:', window.location.origin);

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      console.log('🔐 Résultat:', { data, error });

      if (error) {
        console.error('❌ Erreur lors de l\'envoi:', error);
        throw error;
      }

      console.log('✅ Email envoyé avec succès');
      setMessage('Un email de réinitialisation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.');
      setEmail('');

      // Fermer le modal après 3 secondes
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border-2 border-orange-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cocoa-400 hover:text-cocoa-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-100 to-sunset-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-coral-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-cocoa-900 mb-2">
            Mot de passe oublié ?
          </h2>
          <p className="text-cocoa-600 text-sm">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-cocoa-800 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cocoa-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-coral-500 focus:ring-4 focus:ring-coral-500/20 transition-all"
              />
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg shadow-coral-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Envoyer le lien</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
