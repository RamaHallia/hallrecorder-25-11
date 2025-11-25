# Système Dual de Reset de Mot de Passe

## 🎯 Pourquoi 2 systèmes ?

Supabase **ne permet PAS** de désactiver complètement les emails de reset automatiques. Même si on crée notre propre système OTP, Supabase enverra quand même ses propres emails avec des liens contenant des tokens de session.

**Solution adoptée** : Supporter les 2 flows en parallèle, mais **sans jamais connecter automatiquement** l'utilisateur.

## 🔥 Les 2 flows parallèles

### Flow 1 : OTP via Resend (Recommandé)

```
1. Utilisateur → /forgot-password
2. Entre email
3. Edge Function génère code 6 chiffres
4. Email Resend avec code
5. Utilisateur → /verify-code
6. Entre code + nouveau mot de passe
7. Update via Admin API (admin.updateUserById)
8. Redirection /login
9. Connexion manuelle avec nouveau mot de passe
```

**Avantages** :
- ✅ Moderne et professionnel
- ✅ Code à 6 chiffres visible dans l'email
- ✅ Admin API = aucune session créée
- ✅ UX simple

### Flow 2 : Lien Supabase (Fallback sécurisé)

```
1. Utilisateur → /forgot-password (ou directement Supabase)
2. Supabase envoie email automatique avec lien
3. Utilisateur clique sur le lien
4. Redirection → /auth/callback
5. Callback détecte PASSWORD_RECOVERY
6. signOut() pour éviter connexion auto
7. Redirection → /reset-password?token=xxx
8. Utilisateur entre nouveau mot de passe
9. Client TEMPORAIRE avec persistSession: false
10. setSession() + updateUser() sur client isolé
11. signOut() sur client principal
12. Redirection /login
13. Connexion manuelle avec nouveau mot de passe
```

**Points clés** :
- ✅ Utilise client Supabase temporaire avec `persistSession: false`
- ✅ Session jamais sauvegardée dans localStorage
- ✅ Même en rafraîchissant la page, pas de connexion auto
- ✅ Fallback si utilisateur reçoit email Supabase

## 🔐 Sécurité : Pas de connexion automatique

### Problème évité

Sans ces protections :
```javascript
// ❌ MAUVAIS
await supabase.auth.setSession({ access_token, refresh_token });
await supabase.auth.updateUser({ password });
// → L'utilisateur est CONNECTÉ automatiquement
// → Rafraîchir la page = toujours connecté
```

### Solution implémentée

```javascript
// ✅ BON - Client temporaire isolé
const tempClient = createClient(url, key, {
  auth: {
    persistSession: false,      // ← NE SAUVEGARDE PAS la session
    autoRefreshToken: false,    // ← N'auto-refresh PAS le token
  }
});

await tempClient.auth.setSession({ access_token, refresh_token });
await tempClient.auth.updateUser({ password });
await supabase.auth.signOut(); // Sur le client principal

// → Session temporaire uniquement
// → Jamais persistée
// → Rafraîchir = pas de session
```

## 📝 Implémentation technique

### AuthCallbackPage.tsx

```typescript
if (data?.event === 'PASSWORD_RECOVERY') {
  console.log('🔐 PASSWORD_RECOVERY détecté');

  const accessToken = data.session?.access_token;
  const refreshToken = data.session?.refresh_token;

  // IMPORTANT : Déconnecter AVANT de rediriger
  await supabase.auth.signOut();

  navigate(`/reset-password?token=${accessToken}&refresh_token=${refreshToken}`);
  return; // ← Ne pas continuer vers dashboard
}
```

### ResetPasswordPage.tsx

```typescript
// Créer client temporaire ISOLÉ
const tempClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,   // ← Clé de la sécurité
      autoRefreshToken: false,
    },
  }
);

// Utiliser le client temporaire
await tempClient.auth.setSession({ access_token, refresh_token });
await tempClient.auth.updateUser({ password: newPassword });

// S'assurer que le client principal est déconnecté
await supabase.auth.signOut();

// Redirection vers login
navigate('/login');
```

### VerifyCodePage.tsx (Flow OTP)

```typescript
// Appelle Edge Function avec code OTP
const { data, error } = await supabase.functions.invoke('verify-reset-code', {
  body: { email, code, newPassword }
});

// Edge Function utilise admin.updateUserById()
// → Aucune session créée côté client
// → Utilisateur JAMAIS connecté automatiquement

navigate('/login');
```

## 🧪 Tests de non-connexion

### Test 1 : Flow OTP
1. `/forgot-password` → Entre email
2. Reçois email Resend avec code
3. `/verify-code` → Entre code + nouveau mot de passe
4. Vérifie redirection `/login`
5. ✅ Vérifier : **pas de session active**
6. Rafraîchir la page → `/login` (pas de redirect dashboard)
7. Se connecter manuellement → Succès

### Test 2 : Flow lien Supabase
1. Clique sur lien Supabase dans email
2. Redirection `/auth/callback` puis `/reset-password`
3. Entre nouveau mot de passe
4. Vérifie redirection `/login`
5. ✅ Vérifier : **pas de session active**
6. Rafraîchir la page → `/login` (pas de redirect dashboard)
7. Se connecter manuellement → Succès

### Test 3 : Rafraîchissement de page
1. Pendant le flow de reset, copie l'URL `/reset-password?token=xxx`
2. Ouvre dans nouvel onglet
3. Entre nouveau mot de passe
4. Après succès, rafraîchir la page
5. ✅ Vérifier : **toujours sur /login, pas connecté**

### Vérification technique (Console Dev)

```javascript
// Après un reset réussi, dans la console :
supabase.auth.getSession().then(({ data }) => {
  console.log('Session:', data.session);
  // ✅ Doit être NULL
});

localStorage.getItem('sb-[project-id]-auth-token');
// ✅ Doit être NULL ou vide
```

## 📧 Emails

### Email Resend (Flow OTP)

**From** : `Hallia Support <support@help.hallia.ai>`

**Contenu** :
- Code à 6 chiffres en grand
- Expire dans 15 minutes
- Design moderne avec couleurs Hallia

### Email Supabase (Flow lien)

**From** : Supabase (par défaut)

**Contenu** :
- Lien avec token
- Template Supabase par défaut

**Note** : L'utilisateur peut utiliser les 2 emails, mais le flow OTP est recommandé.

## 🎯 Résumé des protections

| Protection | Implémentation |
|------------|----------------|
| Pas de session auto | `persistSession: false` sur client temporaire |
| Pas d'auto-refresh | `autoRefreshToken: false` |
| signOut explicite | `await supabase.auth.signOut()` après update |
| Client isolé | `createClient()` nouveau pour reset uniquement |
| Admin API (OTP) | `admin.updateUserById()` sans session client |
| Redirection forcée | `navigate('/login')` après succès |
| Pas de getSession | Jamais appelé pendant le reset |

## ✅ Checklist finale

- [x] AuthCallbackPage détecte PASSWORD_RECOVERY
- [x] signOut() avant redirection vers /reset-password
- [x] Client temporaire avec persistSession: false
- [x] updateUser() sur client isolé
- [x] signOut() après update
- [x] Redirection forcée vers /login
- [x] Flow OTP avec Admin API
- [x] Emails Resend configurés
- [x] Tests de rafraîchissement OK
- [x] Vérification session = null après reset

## 🚀 Déploiement

1. **Migrations** : Déjà appliquées
2. **Edge Functions** : `send-reset-code`, `verify-reset-code`
3. **Frontend** : Build sans erreurs
4. **Resend** : API Key configurée

**Le système est production-ready et sécurisé.**

L'utilisateur ne sera **JAMAIS** connecté automatiquement après un reset de mot de passe, que ce soit via le flow OTP ou le lien Supabase.
