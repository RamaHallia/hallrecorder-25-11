# Désactiver les emails automatiques de Supabase

## Problème

Supabase envoie automatiquement des emails avec des tokens URL lors du reset de mot de passe. Comme on utilise maintenant un système OTP custom, il faut **désactiver ces emails automatiques**.

## Solution : Désactiver les emails de Password Reset

### Étape 1 : Aller dans le Dashboard Supabase

1. Ouvre ton projet Supabase : https://supabase.com/dashboard
2. Sélectionne ton projet

### Étape 2 : Désactiver les emails de reset

1. Va dans **Authentication** (menu gauche)
2. Clique sur **Email Templates**
3. Trouve la section **"Reset Password"** ou **"Password Recovery"**
4. **Désactive complètement cet email** ou modifie le template pour ne rien envoyer

### Option alternative : Supprimer le contenu du template

Si tu ne peux pas désactiver l'email, vide simplement le template :

```
Subject: (laisse vide)
Body: (laisse vide)
```

## ✅ Résultat attendu

Après cette modification :
- L'utilisateur demande un reset via `/forgot-password`
- **AUCUN email Supabase** n'est envoyé
- Notre Edge Function génère un code OTP
- Le code s'affiche dans l'UI (mode dev)
- L'utilisateur entre le code sur `/verify-code`
- Le mot de passe est réinitialisé via notre système

## 🧪 Test

1. Va sur `/forgot-password`
2. Entre ton email
3. Tu devrais voir le code à 6 chiffres s'afficher dans l'interface (mode dev)
4. Tu es automatiquement redirigé vers `/verify-code` avec le code pré-rempli
5. Entre un nouveau mot de passe
6. Clique sur "Réinitialiser"
7. Tu es redirigé vers `/login`
8. Connecte-toi avec le nouveau mot de passe

## 📧 Pour envoyer de vrais emails plus tard

Quand tu voudras envoyer de vrais emails avec le code OTP :

### Option 1 : Utiliser Resend (recommandé)

```typescript
// Dans send-reset-code/index.ts
import { Resend } from 'npm:resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'noreply@tondomaine.com',
  to: email,
  subject: 'Code de réinitialisation',
  html: `
    <h1>Réinitialisation de mot de passe</h1>
    <p>Votre code de vérification est :</p>
    <h2 style="font-size: 32px; letter-spacing: 8px; font-family: monospace;">
      ${code}
    </h2>
    <p>Ce code expire dans 15 minutes.</p>
  `,
});
```

### Option 2 : Utiliser votre SMTP existant

Vous avez déjà une fonction SMTP dans le projet (`send-email-smtp`). Adaptez-la pour envoyer le code OTP.

## 🔐 Sécurité en production

**IMPORTANT** : En production, retire le `debug_code` de la réponse :

```typescript
// Dans send-reset-code/index.ts
return new Response(
  JSON.stringify({
    success: true,
    message: "Un code de vérification a été envoyé à votre email",
    // ❌ NE PAS INCLURE : debug_code: code
  }),
  { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
);
```

Et dans `ForgotPasswordPage.tsx`, retire l'affichage du code et la redirection automatique.

## 📝 Checklist finale

- [ ] Désactiver les emails Supabase "Password Reset"
- [ ] Tester le flow complet avec le code affiché en dev
- [ ] Intégrer un service d'email (Resend, SMTP, etc.)
- [ ] Retirer `debug_code` en production
- [ ] Tester avec de vrais emails
- [ ] Vérifier l'expiration des codes (15 min)
- [ ] Vérifier qu'un code ne peut être utilisé qu'une seule fois
