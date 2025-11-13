# Intégration Stripe - Mise à jour de la base de données

## Résumé des modifications

J'ai mis à jour le système de paiement Stripe pour qu'il synchronise automatiquement la table `user_subscriptions` lorsqu'un utilisateur paie un abonnement.

## Tarifs

- **Formule Starter** : 39€ HT / mois (600 minutes)
- **Formule Illimitée** : 49€ HT / mois (minutes illimitées)
- Sans engagement

## Modifications effectuées

### 1. Webhook Stripe (`supabase/functions/stripe-webhook/index.ts`)

Le webhook a été amélioré pour :

- **Mapper les Price IDs Stripe aux types de plans** :
  - `price_1SSyMI14zZqoQtSCb1gqGhke` → `starter` (39€ HT, 600 minutes/mois)
  - `price_1SSyNh14zZqoQtSCqPL9VwTj` → `unlimited` (49€ HT, minutes illimitées)

- **Mettre à jour automatiquement `user_subscriptions`** :
  ```typescript
  await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan_type: planType,              // 'starter' ou 'unlimited'
    minutes_quota: planType === 'starter' ? 600 : null,
    billing_cycle_start: billingCycleStart,
    billing_cycle_end: billingCycleEnd,
    is_active: isActive,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    updated_at: new Date().toISOString(),
  })
  ```

### 2. Page Abonnement (`src/components/Subscription.tsx`)

- **Redirection vers Stripe Checkout** : Au lieu de modifier directement la base de données, le bouton "Changer de formule" redirige maintenant vers Stripe pour effectuer le paiement
- **Indicateur de chargement** : Affichage d'un loader pendant la redirection
- **Gestion des erreurs** : Messages d'erreur clairs en cas de problème

### 3. Suppression du code de Settings.tsx

La section "Gérer mon abonnement" a été complètement déplacée de la page Paramètres vers la page Abonnement.

## Flux de paiement

1. **L'utilisateur clique sur "Changer de formule"** ou "Activer la formule"
2. **Appel à l'Edge Function** `stripe-checkout` qui crée une session Stripe
3. **Redirection vers Stripe** : L'utilisateur est redirigé vers le formulaire de paiement Stripe
4. **Paiement effectué** : Stripe traite le paiement
5. **Webhook déclenché** : Stripe envoie un webhook à `stripe-webhook`
6. **Base de données mise à jour** :
   - Table `stripe_subscriptions` : Détails techniques de l'abonnement Stripe
   - Table `user_subscriptions` : Données de l'application (plan, quota, dates)
7. **Redirection vers l'app** : L'utilisateur revient sur `/#subscription`
8. **Affichage mis à jour** : Les informations d'abonnement sont chargées depuis la base de données

## Ce qui se passe lors d'un paiement

Quand un utilisateur paie via Stripe :

1. ✅ **stripe_subscriptions** est mise à jour avec les détails Stripe
2. ✅ **user_subscriptions** est mise à jour avec :
   - `plan_type` : 'starter' ou 'unlimited'
   - `minutes_quota` : 600 pour starter, null pour unlimited
   - `billing_cycle_start` et `billing_cycle_end` : Dates du cycle de facturation
   - `is_active` : true si l'abonnement est actif
   - `stripe_customer_id` et `stripe_price_id` : Liens vers Stripe

## Déploiement

⚠️ **Important** : Vous devez déployer la fonction Edge mise à jour :

```bash
npx supabase functions deploy stripe-webhook
```

Ou via le dashboard Supabase en copiant le code de `supabase/functions/stripe-webhook/index.ts`.

## Notes importantes

1. **Price IDs** : Les Price IDs Stripe sont codés en dur dans le webhook. Si vous changez vos prix dans Stripe, vous devrez mettre à jour le mapping dans le webhook.

2. **Webhook Secret** : Assurez-vous que la variable d'environnement `STRIPE_WEBHOOK_SECRET` est configurée dans Supabase.

3. **Test en mode développement** : Utilisez Stripe CLI pour tester le webhook localement :
   ```bash
   stripe listen --forward-to https://votre-projet.supabase.co/functions/v1/stripe-webhook
   ```

4. **Changement de plan** : Quand un utilisateur change de plan, Stripe crée un nouvel abonnement et le webhook met à jour automatiquement `user_subscriptions`.

## Vérification

Pour vérifier que tout fonctionne :

1. Allez sur la page Abonnement
2. Sélectionnez une formule
3. Cliquez sur "Activer la formule"
4. Effectuez un paiement test sur Stripe
5. Vérifiez dans la base de données que `user_subscriptions` a été mise à jour avec les bonnes valeurs
