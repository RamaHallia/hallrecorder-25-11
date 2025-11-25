#!/bin/bash

echo "🚀 Déploiement de la fonction de tracking d'email..."
echo ""

echo "📧 Déploiement de email-open-tracker..."
supabase functions deploy email-open-tracker

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Améliorations du tracking :"
echo "  ✓ Ignore les ouvertures dans les 30 premières secondes (scanners)"
echo "  ✓ Filtre les user-agents suspects (bots, crawlers, etc.)"
echo "  ✓ Log détaillé pour le debugging"


