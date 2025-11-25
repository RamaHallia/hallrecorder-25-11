#!/bin/bash

echo "🚀 Déploiement des fonctions de support..."
echo ""

echo "📤 Déploiement de send-ticket-to-support..."
supabase functions deploy send-ticket-to-support

echo ""
echo "📨 Déploiement de support-auto-reply..."
supabase functions deploy support-auto-reply

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "💡 N'oubliez pas de configurer RESEND_API_KEY si ce n'est pas déjà fait :"
echo "   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx"

