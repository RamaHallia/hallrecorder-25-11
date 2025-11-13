# Téléchargement des factures - Documentation

## Vue d'ensemble

Les utilisateurs peuvent maintenant télécharger leurs factures Stripe directement depuis la page Abonnement, sans avoir à passer par le portail Stripe.

## Fonctionnalités

### 1. Récupération automatique des factures
- Les factures sont chargées automatiquement depuis Stripe via une Edge Function
- Affichage de toutes les factures de l'utilisateur (jusqu'à 100 factures)
- Mise à jour en temps réel

### 2. Informations affichées par facture
- **Numéro de facture** : Identifiant unique
- **Date d'émission** : Format français (ex: 13 novembre 2025)
- **Montant** : Prix avec devise (EUR)
- **Statut** :
  - ✅ "Payée" (badge vert) pour les factures payées
  - ⏳ "En attente" (badge orange) pour les factures en attente
- **Description** : Type d'abonnement

### 3. Téléchargement PDF
- Bouton "PDF" pour chaque facture
- Téléchargement direct depuis Stripe
- Ouverture dans un nouvel onglet

## Architecture technique

### Edge Function : `get-invoices`

**Fichier** : `supabase/functions/get-invoices/index.ts`

**Fonctionnement** :
1. Authentification de l'utilisateur via le token Supabase
2. Récupération du `customer_id` Stripe depuis la table `stripe_customers`
3. Appel à l'API Stripe pour lister les factures
4. Formatage des données pour le frontend

**Endpoint** : `GET /functions/v1/get-invoices`

**Headers requis** :
```
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

**Réponse** :
```json
{
  "invoices": [
    {
      "id": "in_xxxxx",
      "number": "ABC-1234",
      "amount": 49.00,
      "currency": "EUR",
      "status": "paid",
      "created": 1699876543,
      "invoice_pdf": "https://pay.stripe.com/invoice/...",
      "hosted_invoice_url": "https://invoice.stripe.com/i/...",
      "description": "Abonnement Illimité",
      "period_start": 1699876543,
      "period_end": 1702555343
    }
  ]
}
```

### Interface utilisateur

**Composant** : `src/components/Subscription.tsx`

**Nouvelles interfaces TypeScript** :
```typescript
interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  description: string;
  period_start: number;
  period_end: number;
}
```

**États ajoutés** :
- `invoices`: Liste des factures
- `isLoadingInvoices`: Indicateur de chargement

## Mise en place

### 1. Déployer l'Edge Function

```bash
npx supabase functions deploy get-invoices
```

### 2. Variables d'environnement requises

Les variables suivantes doivent être configurées dans Supabase :
- `STRIPE_SECRET_KEY` : Clé secrète Stripe
- `SUPABASE_URL` : URL du projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role

### 3. Configuration Stripe

Aucune configuration supplémentaire n'est nécessaire dans Stripe. Les factures sont générées automatiquement lors des paiements d'abonnement.

## Sécurité

### Authentification
- ✅ Vérification du token Supabase
- ✅ Validation de l'utilisateur
- ✅ Accès limité aux factures de l'utilisateur connecté

### RLS (Row Level Security)
- Les factures sont récupérées via l'API Stripe
- Seul le `customer_id` associé à l'utilisateur est utilisé
- Impossible d'accéder aux factures d'un autre utilisateur

### CORS
- Headers CORS configurés pour l'accès depuis le frontend
- Méthodes autorisées : GET, POST, OPTIONS

## Cas d'usage

### Utilisateur avec abonnement
1. L'utilisateur se connecte
2. Va sur la page "Abonnement"
3. Voit la section "Mes factures" avec toutes ses factures
4. Peut cliquer sur "PDF" pour télécharger chaque facture

### Nouvel utilisateur
- Affichage du message "Aucune facture disponible"
- Une fois le premier paiement effectué, les factures apparaissent

### États de facture
- **Payée** : Facture acquittée (badge vert)
- **En attente** : Paiement en cours (badge orange)
- **Autres statuts** : Affichés sans badge spécifique

## Avantages

### Pour l'utilisateur
- ✅ Accès direct aux factures sans quitter l'application
- ✅ Téléchargement PDF en un clic
- ✅ Vue d'ensemble de l'historique de facturation
- ✅ Statuts clairs pour chaque facture

### Pour le développeur
- ✅ Intégration native avec Stripe
- ✅ Pas de stockage de factures côté serveur
- ✅ Sécurisé et conforme
- ✅ Facile à maintenir

## Limitations

- Affiche jusqu'à 100 factures (limite de l'API Stripe)
- Nécessite un abonnement Stripe actif ou passé
- Les factures sont générées uniquement pour les paiements d'abonnement

## Dépannage

### Les factures ne s'affichent pas
1. Vérifier que l'Edge Function est déployée
2. Vérifier que les variables d'environnement sont configurées
3. Vérifier que l'utilisateur a un `customer_id` dans `stripe_customers`
4. Vérifier les logs de l'Edge Function dans Supabase

### Erreur "Client Stripe introuvable"
- L'utilisateur n'a pas encore effectué de paiement
- Créer un abonnement pour générer le `customer_id`

### PDF non disponible
- Certaines factures peuvent ne pas avoir de PDF (status draft)
- Le bouton "PDF" n'apparaît que si `invoice_pdf` existe

## Build

✅ Le projet compile sans erreur avec la nouvelle fonctionnalité.
