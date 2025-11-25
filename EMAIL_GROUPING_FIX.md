# 🔧 Correction : Affichage groupé des emails

## 🐛 Problème

Après l'implémentation de l'envoi individuel, l'historique des emails affichait :

```
❌ AVANT :
📧 badrhannaoui2015@gmail.com  (1/1 ouvert)
📧 badrhannaoui2017@gmail.com  (1/1 ouvert)
📧 imadsettati@gmail.com       (1/1 ouvert)
📧 imadeddinehannaoui@gmail.com (1/1 ouvert)
```

Au lieu de :

```
✅ ATTENDU :
📧 badrhannaoui2015@gmail.com, badrhannaoui2017@gmail.com, 
   imadsettati@gmail.com, imadeddinehannaoui@gmail.com  (1/4 ouvert)
```

## 🔍 Cause

Avec l'envoi individuel, **chaque destinataire reçoit un email séparé**, donc il y a **4 entrées distinctes** dans `email_history` :

```sql
-- 4 lignes dans la base de données
tracking_id: abc-123  |  recipients: badrhannaoui2015@gmail.com
tracking_id: abc-123  |  recipients: badrhannaoui2017@gmail.com
tracking_id: abc-123  |  recipients: imadsettati@gmail.com
tracking_id: abc-123  |  recipients: imadeddinehannaoui@gmail.com
```

Mais elles ont toutes le **même `tracking_id`** car elles font partie du **même envoi**.

## ✅ Solution

**Grouper les emails par `tracking_id`** avant de les afficher.

### Fonction de groupement

```typescript
const groupEmailsByTrackingId = (emails: EmailHistoryItem[]): EmailHistoryItem[] => {
  const grouped = new Map<string, EmailHistoryItem>();

  emails.forEach(email => {
    const trackingId = email.tracking_id || email.id;
    
    if (grouped.has(trackingId)) {
      // Fusionner avec l'email existant
      const existing = grouped.get(trackingId)!;
      
      // Combiner les destinataires
      const allRecipients = [
        ...parseRecipientList(existing.recipients),
        ...parseRecipientList(email.recipients),
      ];
      existing.recipients = Array.from(new Set(allRecipients)).join(', ');
      
      // Combiner les CC
      if (email.cc_recipients) {
        const allCC = [
          ...parseRecipientList(existing.cc_recipients || ''),
          ...parseRecipientList(email.cc_recipients),
        ];
        existing.cc_recipients = Array.from(new Set(allCC)).filter(c => c).join(', ');
      }
      
      // Combiner les events d'ouverture
      existing.email_open_events = [
        ...(existing.email_open_events || []),
        ...(email.email_open_events || []),
      ];
    } else {
      // Premier email de ce groupe
      grouped.set(trackingId, { ...email });
    }
  });

  return Array.from(grouped.values());
};
```

### Utilisation

```typescript
const loadEmails = async () => {
  const { data, error } = await supabase
    .from('email_history')
    .select('*, email_open_events(recipient_email, opened_at)')
    .eq('user_id', userId)
    .order('sent_at', { ascending: false })
    .limit(200); // Plus large pour inclure tous les envois individuels

  if (error) throw error;
  
  // 🎯 Grouper par tracking_id
  const groupedEmails = groupEmailsByTrackingId(data || []);
  setEmails(groupedEmails);
};
```

## 📊 Résultat

### Base de données (inchangé)
```
4 lignes avec le même tracking_id
```

### Interface utilisateur (groupé)
```
✅ 1 seule carte affichée :
📧 Gestion des modes de résumé et support technique
   👥 badrhannaoui2015@gmail.com, badrhannaoui2017@gmail.com,
      imadsettati@gmail.com, imadeddinehannaoui@gmail.com
   📅 Il y a moins d'une heure
   📧 SMTP
   👁️ 1/4 ouverts
   
   [Cliquer sur "Suivi des destinataires"]
   
   ┌───────────────────────────────┬─────────┬──────────────────┐
   │ Destinataire                  │ Statut  │ Date/Heure       │
   ├───────────────────────────────┼─────────┼──────────────────┤
   │ badrhannaoui2015@gmail.com    │ ✅ Ouvert│ 21 nov. 17:11   │
   │ badrhannaoui2017@gmail.com    │ ⏳ Non  │ -                │
   │ imadsettati@gmail.com         │ ⏳ Non  │ -                │
   │ imadeddinehannaoui@gmail.com  │ ⏳ Non  │ -                │
   └───────────────────────────────┴─────────┴──────────────────┘
```

## 🎯 Avantages

1. **Interface cohérente** : L'utilisateur voit un seul envoi, pas 4 lignes séparées
2. **Tracking précis** : Le compteur "1/4 ouverts" est correct
3. **Compatibilité** : Fonctionne aussi avec les anciens emails (avant l'envoi individuel)
4. **Fallback intelligent** : Si pas de `tracking_id`, utilise l'`id` de l'email

## 🔄 Compatibilité ascendante

### Anciens emails (avant le fix)
- Pas de `tracking_id` ou `tracking_id` unique par email
- → Affichés comme avant (une ligne par email)

### Nouveaux emails (après le fix)
- Même `tracking_id` pour tous les destinataires d'un envoi
- → Groupés en une seule ligne

## 📝 Fichier modifié

- `src/components/EmailHistory.tsx`
  - Augmenté la limite de 50 à 200 emails
  - Ajouté la fonction `groupEmailsByTrackingId()`
  - Appliqué le groupement avant `setEmails()`

## ✨ Test

1. Rafraîchir la page
2. Aller dans "Email History"
3. Vous devriez voir **une seule carte** avec **tous les destinataires**
4. Le compteur devrait afficher **1/4 ouverts**
5. Cliquer sur "Suivi des destinataires" pour voir le détail

---

✅ **L'affichage est maintenant cohérent avec l'envoi individuel !**

