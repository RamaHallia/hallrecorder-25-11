# Système OTP pour Reset de Mot de Passe

Système professionnel de réinitialisation de mot de passe par code OTP (One-Time Password) à 6 chiffres.

## 🎯 Avantages du système OTP

✅ **Aucune connexion automatique** - L'utilisateur n'est JAMAIS connecté automatiquement
✅ **Aucun token dans l'URL** - Pas de risque de partage accidentel de lien
✅ **Impossible de rester connecté** - Rafraîchir la page ne change rien
✅ **UX moderne** - Flow similaire à Apple, WhatsApp, Stripe
✅ **Sécurité maximale** - Code expire après 15 minutes

## 🔥 Flow complet

```
1. /forgot-password
   └─> Utilisateur entre son email
   └─> Appel Edge Function "send-reset-code"
   └─> Génération code 6 chiffres + stockage DB
   └─> Redirection vers /verify-code

2. /verify-code
   └─> Utilisateur entre:
       - Code à 6 chiffres
       - Nouveau mot de passe
       - Confirmation mot de passe
   └─> Appel Edge Function "verify-reset-code"
   └─> Vérification code + expiration
   └─> Update mot de passe via admin API
   └─> Redirection vers /login

3. /login
   └─> L'utilisateur se connecte avec le NOUVEAU mot de passe
```

## 📊 Base de données

### Table `password_reset_codes`

```sql
CREATE TABLE password_reset_codes (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,           -- Code à 6 chiffres
  expires_at timestamptz NOT NULL,  -- Expire après 15 min
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

## 🛠️ Edge Functions

### 1. `send-reset-code`

**Endpoint**: `POST /functions/v1/send-reset-code`

**Body**:
```json
{
  "email": "user@example.com"
}
```

**Fonctionnement**:
1. Vérifie que l'email existe dans Supabase Auth
2. Génère un code aléatoire à 6 chiffres
3. Supprime les anciens codes pour cet email
4. Insère le nouveau code en DB avec expiration 15 min
5. Retourne succès (même si email n'existe pas pour sécurité)

**Response**:
```json
{
  "success": true,
  "message": "Un code de vérification a été envoyé à votre email",
  "debug_code": "123456"
}
```

### 2. `verify-reset-code`

**Endpoint**: `POST /functions/v1/verify-reset-code`

**Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

**Fonctionnement**:
1. Cherche le code en DB (email + code + non utilisé)
2. Vérifie que le code n'est pas expiré
3. Trouve l'utilisateur dans Supabase Auth
4. Update le mot de passe via `admin.updateUserById()`
5. Marque le code comme utilisé

**Response**:
```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

## 🎨 Pages React

### `/forgot-password` - Demande d'email
- Formulaire simple avec champ email
- Appelle `send-reset-code`
- Sauvegarde email dans localStorage
- Redirige vers `/verify-code`

### `/verify-code` - Vérification + Reset
- Affiche l'email (depuis localStorage)
- Champ pour code à 6 chiffres (input numérique)
- Champs pour nouveau mot de passe + confirmation
- Appelle `verify-reset-code`
- Message de succès puis redirection `/login`

## 🔐 Sécurité

### Points clés

1. **Pas de session automatique**
   - Aucun `setSession()` nulle part
   - Le code ne donne PAS accès à l'application
   - L'utilisateur DOIT se reconnecter après reset

2. **Expiration stricte**
   - Codes valides 15 minutes seulement
   - Vérification côté serveur (pas de confiance client)
   - Un code = une utilisation unique

3. **Protection contre bruteforce**
   - Suppression des anciens codes lors d'une nouvelle demande
   - Codes marqués comme utilisés après succès
   - Validation côté serveur uniquement

4. **Isolation email**
   - Un email ne peut avoir qu'un code actif
   - Demander un nouveau code invalide l'ancien

## 📱 UX Professionnelle

### Design moderne
- Interface claire et épurée
- Input code avec formatage automatique (6 chiffres)
- États de chargement visibles
- Messages d'erreur clairs
- Animation de succès

### Flow utilisateur
1. Email oublié ? → Entrez votre email
2. Code envoyé → Consultez vos emails
3. Code + nouveau mot de passe → Tout sur une page
4. Succès → Reconnexion avec nouveau mot de passe

## 🚀 Déploiement

### 1. Appliquer la migration
```bash
# La migration existe déjà
supabase/migrations/20251125000000_create_password_reset_codes.sql
```

### 2. Déployer les Edge Functions

**send-reset-code**:
```bash
supabase functions deploy send-reset-code
```

**verify-reset-code**:
```bash
supabase functions deploy verify-reset-code
```

### 3. Variables d'environnement

Les Edge Functions utilisent automatiquement:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Ces variables sont déjà configurées par Supabase.

## 🧪 Test du système

### Flow de test manuel

1. **Demander un code**
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/send-reset-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

2. **Vérifier en DB** (en dev)
```sql
SELECT * FROM password_reset_codes
WHERE email = 'test@example.com'
ORDER BY created_at DESC
LIMIT 1;
```

3. **Reset le mot de passe**
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/verify-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "code":"123456",
    "newPassword":"newpass123"
  }'
```

### Test UI

1. Aller sur `/forgot-password`
2. Entrer votre email
3. Copier le code depuis la console (debug_code)
4. Aller sur `/verify-code`
5. Entrer le code + nouveau mot de passe
6. Vérifier la redirection vers `/login`
7. Se connecter avec le nouveau mot de passe

## 🔍 Debug

### Logs des Edge Functions

Dans la console Supabase:
- Edge Functions → Logs
- Voir les logs en temps réel
- `debug_code` est loggé (à retirer en prod)

### Vérifier l'expiration

```sql
SELECT
  email,
  code,
  used,
  expires_at,
  expires_at < now() as is_expired,
  created_at
FROM password_reset_codes
ORDER BY created_at DESC;
```

### Nettoyer les anciens codes

```sql
DELETE FROM password_reset_codes
WHERE expires_at < now() OR used = true;
```

## 📝 Améliorations futures

1. **Email réel** - Intégrer Resend ou SendGrid pour envoyer le code par email
2. **Rate limiting** - Limiter à 3 tentatives par email/heure
3. **SMS** - Option d'envoyer le code par SMS
4. **Historique** - Logger les tentatives de reset
5. **Admin dashboard** - Interface pour voir les codes actifs

## ✨ Comparaison avec l'ancien système

| Critère | Ancien (URL Token) | Nouveau (OTP) |
|---------|-------------------|---------------|
| Auto-login | ❌ Oui, problématique | ✅ Non, jamais |
| Token dans URL | ❌ Oui, risque | ✅ Non |
| Rafraîchir page | ❌ Reste connecté | ✅ Pas de session |
| UX | ⚠️ Complexe | ✅ Simple |
| Sécurité | ⚠️ Moyenne | ✅ Élevée |
| Code moderne | ❌ Non | ✅ Oui |

## 🎯 Résultat

Flow de reset de mot de passe professionnel, sécurisé et moderne, sans aucune connexion automatique ni token dans l'URL. L'utilisateur a le contrôle total et doit toujours se reconnecter manuellement après un reset.
