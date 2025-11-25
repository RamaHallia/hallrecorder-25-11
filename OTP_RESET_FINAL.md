# Système de Réinitialisation par OTP

## ✅ Système unique : Code OTP à 6 chiffres

Email envoyé depuis **support@help.hallia.ai** via Resend avec code à 6 chiffres. Changement de mot de passe via Edge Function avec Admin API. Aucune session automatique créée.

## 🔥 Flow complet

```
1. /forgot-password → email
2. Edge Function génère code 6 chiffres
3. Email Resend avec code
4. /verify-code → code + nouveau mot de passe
5. Edge Function update via admin.updateUserById()
6. Redirection /login
7. Connexion manuelle avec nouveau mot de passe
```

## 🔐 Sécurité

- Admin API : `admin.updateUserById()` = pas de session client
- Code expire 15 minutes
- Usage unique
- Pas de token dans URL

## 📧 Email

- **From** : `support@help.hallia.ai`
- Template HTML professionnel
- Code 48px bien visible
- Gradient orange/coral Hallia

## 🛠️ Edge Functions

### send-reset-code
```typescript
POST /functions/v1/send-reset-code
Body: { email: string }
```
- Génère code 6 chiffres
- Stocke en DB avec expiration
- Envoie email Resend

### verify-reset-code
```typescript
POST /functions/v1/verify-reset-code
Body: { email: string, code: string, newPassword: string }
```
- Vérifie code + expiration
- Update mot de passe via Admin API
- Marque code utilisé

## 🧪 Test

1. `/forgot-password` → email
2. Recevoir email Resend
3. `/verify-code` → code + nouveau mdp
4. Redirection `/login`
5. Connexion avec nouveau mdp ✅

## 📝 Base de données

Table `password_reset_codes` :
- email, code, expires_at, used, created_at
- Index sur email et expires_at

## ⚠️ Production

Retirer `debug_code` de la réponse send-reset-code en production.
