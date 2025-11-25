// @deno-types="npm:@types/node"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPPORT_EMAIL = 'support@hallia.ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { ticketId, name, email, category, subject, message, screenshots } = await req.json();

    if (!email || !name || !message) {
      throw new Error('Données du ticket incomplètes');
    }

    console.log('📧 Envoi du ticket au support:', ticketId);

    // Récupérer l'API key Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('⚠️ RESEND_API_KEY non configuré');
      throw new Error('Service d\'email non configuré');
    }

    const categoryLabels: Record<string, string> = {
      question: 'Question',
      bug: 'Bug / Problème technique',
      feature: 'Demande de fonctionnalité',
      other: 'Autre'
    };

    const categoryLabel = categoryLabels[category] || category;

    // Construire l'email pour le support
    const emailSubject = ticketId 
      ? `[Ticket #${ticketId}] ${categoryLabel} - ${subject}`
      : `[Support] ${categoryLabel} - ${subject}`;

    const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau ticket de support</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); padding: 32px 24px; text-align: center;">
              <p style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 8px 0;">HALL Recorder</p>
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Nouveau Ticket</h1>
              ${ticketId ? `<p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0; font-size: 13px; font-family: monospace;">#${ticketId}</p>` : ''}
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">

              <!-- Client Info -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 12px; border-bottom: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Client</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0;">
                    <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 4px 0;">${name}</p>
                    <a href="mailto:${email}" style="color: #F97316; text-decoration: none; font-size: 14px;">${email}</a>
                  </td>
                </tr>
              </table>

              <!-- Category -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <span style="display: inline-block; background-color: #FFF7ED; color: #C2410C; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">
                      ${categoryLabel}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <p style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Sujet</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0; line-height: 1.4;">${subject}</p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <p style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Message</p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 3px solid #F97316;">
                    <p style="color: #374151; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
                  </td>
                </tr>
              </table>

              ${screenshots && screenshots.length > 0 ? `
              <!-- Screenshots -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <p style="color: #6b7280; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Pièces jointes (${screenshots.length})</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    ${screenshots.map((url: string, index: number) => `
                      <a href="${url}" target="_blank" style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 13px; margin: 4px 4px 4px 0;">
                        📎 Capture ${index + 1}
                      </a>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
                       style="display: inline-block; background: linear-gradient(135deg, #F97316 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px;">
                      Répondre au client
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Ticket reçu le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style="color: #d1d5db; font-size: 11px; margin: 8px 0 0 0;">
                HALL Recorder
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textBody = `
🎫 NOUVEAU TICKET DE SUPPORT - HALL RECORDER
${ticketId ? `Ticket #${ticketId}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 APPLICATION : HALL Recorder (Hallia)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 INFORMATIONS CLIENT

Nom : ${name}
Email : ${email}
Catégorie : ${categoryLabel}
${ticketId ? `Ticket ID : #${ticketId}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 SUJET

${subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MESSAGE

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${screenshots && screenshots.length > 0 ? `
📸 CAPTURES D'ÉCRAN (${screenshots.length})

${screenshots.map((url: string, index: number) => `${index + 1}. ${url}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : ''}

Pour répondre au client : ${email}

---
Ticket reçu le ${new Date().toLocaleString('fr-FR')}
© ${new Date().getFullYear()} HALL Recorder - Système de support
    `.trim();

    console.log('📧 Envoi via Resend au support:', SUPPORT_EMAIL);

    // Envoyer l'email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Hallia Support <support@help.hallia.ai>',
        to: [SUPPORT_EMAIL],
        reply_to: email,
        subject: emailSubject,
        html: htmlBody,
        text: textBody
      })
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json();
      console.error('❌ Erreur Resend:', errorData);
      throw new Error(`Erreur Resend: ${JSON.stringify(errorData)}`);
    }

    const resendData = await resendResponse.json();
    console.log('✅ Email envoyé au support:', resendData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ticket envoyé au support',
        emailId: resendData.id,
        ticketId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erreur dans send-ticket-to-support:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur inconnue',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/* To deploy this function:
 *
 * supabase functions deploy send-ticket-to-support
 *
 * Configuration requise:
 * supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
 */

