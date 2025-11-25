import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export const DashboardPage = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-coral-50">
      <nav className="bg-white border-b-2 border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coral-500 to-coral-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-cocoa-900">Dashboard</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-cocoa-700 hover:text-coral-600 font-semibold transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-orange-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-100 to-sunset-100 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-coral-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cocoa-900">Bienvenue !</h2>
              <p className="text-cocoa-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-coral-50 to-sunset-50 rounded-2xl p-6 border-2 border-coral-100">
              <h3 className="text-lg font-bold text-cocoa-900 mb-2">Authentification</h3>
              <p className="text-cocoa-600 text-sm">
                Système d'authentification complet avec Supabase Auth
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-coral-50 rounded-2xl p-6 border-2 border-orange-100">
              <h3 className="text-lg font-bold text-cocoa-900 mb-2">Sécurité</h3>
              <p className="text-cocoa-600 text-sm">
                Routes protégées et gestion des sessions sécurisée
              </p>
            </div>

            <div className="bg-gradient-to-br from-sunset-50 to-coral-50 rounded-2xl p-6 border-2 border-sunset-100">
              <h3 className="text-lg font-bold text-cocoa-900 mb-2">Recovery</h3>
              <p className="text-cocoa-600 text-sm">
                Flow de réinitialisation de mot de passe sans connexion automatique
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Zone protégée
            </h3>
            <p className="text-green-700 text-sm">
              Vous êtes maintenant dans une zone protégée de l'application. Seuls les utilisateurs
              authentifiés peuvent accéder à cette page.
            </p>
          </div>

          <div className="mt-8 border-t-2 border-orange-100 pt-6">
            <h3 className="text-lg font-bold text-cocoa-900 mb-4">Informations du compte</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cocoa-600 font-semibold">Email :</span>
                <span className="text-cocoa-900">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cocoa-600 font-semibold">ID :</span>
                <span className="text-cocoa-900 font-mono text-sm">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cocoa-600 font-semibold">Statut :</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  Connecté
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
