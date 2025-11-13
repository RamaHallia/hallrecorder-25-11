# Mise à jour des tarifs - Récapitulatif

## Nouveaux tarifs

✅ **Formule Starter** : **39€ HT / mois** (sans engagement)
- 600 minutes d'enregistrement / mois
- Transcription automatique
- Résumés IA
- Suggestions en temps réel
- Envoi par email
- Export PDF

✅ **Formule Illimitée** : **49€ HT / mois** (sans engagement)
- Minutes illimitées
- Transcription automatique
- Résumés IA
- Suggestions en temps réel
- Envoi par email
- Export PDF
- Support prioritaire

## Fichiers mis à jour

### 1. Composants React (Frontend)

| Fichier | Ancien prix | Nouveau prix |
|---------|-------------|--------------|
| `src/components/Dashboard.tsx` | 29€ → 39€ | 39€ → 49€ |
| `src/components/QuotaFullModal.tsx` | - | 49€ |
| `src/components/QuotaReachedModal.tsx` | - | 49€ |
| `src/components/UploadQuotaErrorModal.tsx` | - | 49€ |
| `src/components/Subscription.tsx` | ✅ Déjà à jour | ✅ Déjà à jour |
| `src/components/SubscriptionSelection.tsx` | ✅ Déjà à jour | ✅ Déjà à jour |
| `src/components/LandingPage.tsx` | Plans mis à jour | Plans mis à jour |

### 2. Migrations SQL (Base de données)

| Fichier | Modification |
|---------|--------------|
| `supabase/migrations/20251023134243_add_user_subscriptions.sql` | Commentaire mis à jour : 39€ HT et 49€ HT |
| `supabase/migrations/20251113122201_ensure_all_users_have_subscription.sql` | ✅ Déjà à jour |

### 3. Documentation

| Fichier | Modification |
|---------|--------------|
| `STRIPE_PAYMENT_INTEGRATION.md` | Section tarifs ajoutée avec les prix à jour |

## Cohérence des prix dans l'application

Tous les prix affichés sont maintenant **cohérents** dans l'ensemble de l'application :

### Dashboard
- ✅ Formule Starter : 39€/mois
- ✅ Formule Illimitée : 49€/mois

### Modales de quota
- ✅ QuotaFullModal : 49€/mois
- ✅ QuotaReachedModal : 49€/mois
- ✅ UploadQuotaErrorModal : 49€/mois

### Page Abonnement
- ✅ Formule Starter : 39€/mois
- ✅ Formule Illimitée : 49€/mois

### Sélection d'abonnement
- ✅ Formule Starter : 39€/mois
- ✅ Formule Illimitée : 49€/mois

### Landing Page
- ✅ Plans mis à jour avec les nouvelles fonctionnalités et tarifs

## Webhook Stripe

Le webhook Stripe (`supabase/functions/stripe-webhook/index.ts`) mappe correctement les Price IDs :
- `price_1SSyMI14zZqoQtSCb1gqGhke` → **Starter** (39€ HT)
- `price_1SSyNh14zZqoQtSCqPL9VwTj` → **Illimité** (49€ HT)

## Notes importantes

1. **Prix HT** : Les prix sont affichés en HT (Hors Taxes)
2. **Sans engagement** : Les deux formules sont sans engagement
3. **Stripe** : Les Price IDs dans Stripe doivent correspondre aux tarifs affichés (39€ et 49€)
4. **Cohérence** : Tous les prix sont maintenant cohérents dans toute l'application

## Build

✅ Le projet compile sans erreur avec les nouveaux tarifs.
