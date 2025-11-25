import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-cocoa-900 mb-4">Email envoyé</h2>
            <p className="text-cocoa-600 mb-6">
              Nous vous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
              Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
            </p>
            <Link
              to="/login"
              className="block w-full px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white font-bold rounded-xl hover:from-coral-600 hover:to-coral-700 transition-all shadow-lg shadow-coral-500/30 text-center"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cocoa-900 mb-2">Mot de passe oublié</h1>
          <p className="text-cocoa-600">Entrez votre email pour réinitialiser votre mot de passe</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100">
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
                  <Send className="w-5 h-5" />
                  <span>Envoyer le lien</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-coral-600 hover:text-coral-700 font-semibold transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
