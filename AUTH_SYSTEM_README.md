# Système d'Authentification React + Supabase Auth

Système d'authentification complet et sécurisé avec toutes les fonctionnalités demandées.

## 🎯 Fonctionnalités implémentées

✅ **Inscription** avec email + mot de passe
✅ **Connexion** avec gestion de session
✅ **Déconnexion** sécurisée
✅ **Vérification email** lors de l'inscription
✅ **Mot de passe oublié** (password recovery)
✅ **Réinitialisation de mot de passe** SANS connexion automatique
✅ **Protection des routes** avec `<PrivateRoute>`
✅ **Gestion automatique des tokens** avec supabase-js@2

## 📁 Structure des fichiers

```
src/
├── context/
│   └── AuthContext.tsx          # Context d'authentification
├── components/
│   └── auth/
│       └── PrivateRoute.tsx     # Protection des routes
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx        # /login
│   │   ├── SignupPage.tsx       # /signup
│   │   ├── ForgotPasswordPage.tsx   # /forgot-password
│   │   ├── ResetPasswordPage.tsx    # /reset-password
│   │   └── AuthCallbackPage.tsx     # /auth/callback
│   └── DashboardPage.tsx        # /dashboard (protégé)
├── AuthApp.tsx                  # Configuration des routes
└── main-auth.tsx                # Point d'entrée
```

## 🔥 Flow "Mot de passe oublié" (SANS connexion automatique)

### Comment ça fonctionne :

1. **L'utilisateur demande la réinitialisation** (`/forgot-password`)
   - Email envoyé avec lien de recovery

2. **Supabase redirige vers** `/auth/callback?type=recovery&access_token=...`

3. **`AuthCallbackPage` détecte `type=recovery`**
   ```typescript
   if (type === 'recovery') {
     // ⚠️ PAS de connexion automatique
     navigate(`/reset-password?token=${accessToken}`);
     return;
   }
   ```

4. **L'utilisateur arrive sur** `/reset-password`
   - Il entre son nouveau mot de passe
   - `updatePassword()` est appelé
   - Redirection vers `/login` pour se reconnecter

### 🔐 Points clés de sécurité

- ✅ Pas de `setSession()` lors du recovery
- ✅ L'utilisateur DOIT se reconnecter après réinitialisation
- ✅ Le token est passé en paramètre mais pas utilisé pour créer une session
- ✅ Routes protégées avec `<PrivateRoute>` qui vérifie `user !== null`

## 🚀 Utilisation

### Pour tester le système d'authentification :

1. **Modifier le point d'entrée** dans `index.html` :
   ```html
   <script type="module" src="/src/main-auth.tsx"></script>
   ```

2. **Ou créer une page de démo** :
   ```typescript
   import { AuthApp } from './AuthApp';

   // Utiliser <AuthApp /> au lieu de <App />
   ```

### Routes disponibles :

| Route | Description | Protection |
|-------|-------------|------------|
| `/login` | Connexion | Public |
| `/signup` | Inscription | Public |
| `/forgot-password` | Demande de reset | Public |
| `/reset-password` | Nouveau mot de passe | Public (avec token) |
| `/auth/callback` | Callback Supabase | Public |
| `/dashboard` | Page protégée | **Protégé** |

## 🔑 Configuration Supabase

Le système utilise automatiquement votre configuration Supabase existante dans `src/lib/supabase.ts`.

### Redirections à configurer dans Supabase Dashboard :

1. Aller dans **Authentication > URL Configuration**
2. Ajouter dans **Redirect URLs** :
   ```
   http://localhost:5173/auth/callback
   https://your-domain.com/auth/callback
   ```

## 💡 Exemple d'utilisation du contexte

```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) {
    return <button onClick={() => signIn(email, password)}>Connexion</button>;
  }

  return (
    <div>
      <p>Connecté en tant que {user.email}</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  );
}
```

## 🛡️ Protection des routes

```typescript
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  }
/>
```

Le `<PrivateRoute>` :
- Vérifie si `user` existe
- Redirige vers `/login` si non connecté
- Affiche un loader pendant la vérification

## 📊 Flow complet visualisé

```
┌─────────────────┐
│   /signup       │ → Inscription → Email de vérification
└─────────────────┘

┌─────────────────┐
│   /login        │ → Connexion → /dashboard
└─────────────────┘

┌─────────────────┐
│ /forgot-password│ → Email envoyé
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /auth/callback  │ → Détecte type=recovery
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /reset-password │ → Nouveau mot de passe
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   /login        │ → Reconnexion requise ✅
└─────────────────┘
```

## ✨ Design

Le système utilise un design moderne avec :
- Gradients orange/coral
- Animations fluides
- États de chargement
- Messages d'erreur clairs
- Design responsive

## 🔧 Technologies

- **React 18** avec TypeScript
- **React Router 6** pour le routing
- **Supabase Auth** pour l'authentification
- **Tailwind CSS** pour le style
- **Lucide React** pour les icônes

## 📝 Notes importantes

1. **Email de vérification** : Par défaut, Supabase envoie un email de confirmation lors de l'inscription. Vous pouvez le désactiver dans le dashboard Supabase.

2. **Configuration des emails** : Personnalisez les templates d'emails dans Supabase Dashboard > Authentication > Email Templates.

3. **Sécurité** : Le système n'expose jamais les tokens côté client sauf lors du callback nécessaire.

4. **Production** : N'oubliez pas de configurer les redirect URLs de production dans Supabase.
