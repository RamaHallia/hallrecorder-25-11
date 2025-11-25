# 🔧 Fix Erreur 409 - Contrainte Unique sur tracking_id

## 🐛 Erreur constatée

```
hgpwuljzgtlrwudhqtuq.supabase.co/rest/v1/email_history?select=id:1 
Failed to load resource: the server responded with a status of 409 ()
```

**Statut HTTP 409 Conflict** = Violation d'une contrainte unique dans la base de données

## 🔍 Cause

Lors de la migration `20251103000100_add_email_tracking.sql`, un **index UNIQUE** a été créé sur `tracking_id` :

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_history_tracking_id
  ON email_history(tracking_id);
```

**Problème :**
- Avec l'envoi individuel, on utilise le **même `tracking_id`** pour tous les destinataires d'un envoi
- Exemple : 4 destinataires → 4 insertions avec le même `tracking_id`
- La contrainte unique empêche la 2ème, 3ème, 4ème insertion → **Erreur 409**

## ✅ Solution

**Supprimer la contrainte d'unicité** et la remplacer par un **index normal** (non-unique).

### Étapes à suivre

#### 1. Appliquer la migration SQL

Connectez-vous à votre dashboard Supabase :
- https://supabase.com/dashboard/project/YOUR_PROJECT_ID

Allez dans **SQL Editor** et exécutez :

```sql
-- Supprimer l'index unique
DROP INDEX IF EXISTS idx_email_history_tracking_id;

-- Créer un index normal (non-unique)
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_id 
  ON email_history(tracking_id);

-- Index composite pour optimiser les requêtes de groupement
CREATE INDEX IF NOT EXISTS idx_email_history_tracking_sent 
  ON email_history(tracking_id, sent_at DESC);
```

Ou copiez le contenu du fichier `apply-tracking-fix-migration.sql`.

#### 2. Vérifier que la migration est appliquée

```sql
-- Vérifier les index sur email_history
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'email_history' 
  AND indexname LIKE '%tracking%';
```

Vous devriez voir :
- ✅ `idx_email_history_tracking_id` (sans UNIQUE)
- ✅ `idx_email_history_tracking_sent`

#### 3. Tester l'envoi

Envoyez un email à 2+ destinataires et vérifiez dans la console :

```
✅ Email envoyé à user1@mail.com
✅ Email envoyé à user2@mail.com
✅ 2 emails envoyés individuellement pour tracking précis
```

Pas d'erreur 409 ! ✅

#### 4. Vérifier dans la base de données

```sql
-- Voir les emails avec le même tracking_id
SELECT 
  tracking_id, 
  COUNT(*) as count,
  string_agg(recipients, ', ') as all_recipients,
  MAX(sent_at) as sent_at
FROM email_history 
WHERE tracking_id IS NOT NULL
GROUP BY tracking_id 
HAVING COUNT(*) > 1
ORDER BY MAX(sent_at) DESC;
```

Vous devriez voir vos emails groupés par `tracking_id` ✅

## 📊 Avant / Après

### Avant (avec contrainte unique)

```
Envoi 1 → user1@mail.com → tracking_id: abc-123 ✅
Envoi 2 → user2@mail.com → tracking_id: abc-123 ❌ Erreur 409 !
Envoi 3 → user3@mail.com → tracking_id: abc-123 ❌ Erreur 409 !
```

Résultat : Seul le 1er email est enregistré dans l'historique

### Après (sans contrainte unique)

```
Envoi 1 → user1@mail.com → tracking_id: abc-123 ✅
Envoi 2 → user2@mail.com → tracking_id: abc-123 ✅
Envoi 3 → user3@mail.com → tracking_id: abc-123 ✅
```

Résultat : Les 3 emails sont enregistrés et groupés par l'interface ✅

## 🎯 Pourquoi c'est sûr ?

1. **Performance maintenue** : L'index non-unique optimise toujours les requêtes `WHERE tracking_id = '...'`
2. **Groupement fonctionnel** : `EmailHistory.tsx` regroupe correctement par `tracking_id`
3. **Compatibilité** : Les anciens emails (sans duplication de `tracking_id`) continuent de fonctionner
4. **Intégrité des données** : Chaque email a toujours son propre `id` unique (clé primaire)

## 🔄 Rollback (si besoin)

Si vous voulez revenir en arrière (déconseillé) :

```sql
-- Supprimer les doublons si nécessaire
DELETE FROM email_history a
USING email_history b
WHERE a.id < b.id 
  AND a.tracking_id = b.tracking_id
  AND a.tracking_id IS NOT NULL;

-- Recréer la contrainte unique
DROP INDEX IF EXISTS idx_email_history_tracking_id;
CREATE UNIQUE INDEX idx_email_history_tracking_id
  ON email_history(tracking_id);
```

Mais attention : L'envoi individuel ne fonctionnera plus !

## 📝 Fichiers créés

- `supabase/migrations/20251121180000_remove_tracking_id_unique_constraint.sql`
- `apply-tracking-fix-migration.sql` (à exécuter manuellement)
- `FIX_409_ERROR.md` (cette documentation)

## ✅ Checklist

- [ ] Connecté au dashboard Supabase
- [ ] Copié/exécuté le SQL de migration
- [ ] Vérifié que l'index unique est supprimé
- [ ] Testé l'envoi à 2+ destinataires
- [ ] Pas d'erreur 409 dans la console
- [ ] Tous les emails s'affichent groupés dans l'historique

---

🎉 **Après cette migration, l'envoi individuel avec tracking précis fonctionnera parfaitement !**


