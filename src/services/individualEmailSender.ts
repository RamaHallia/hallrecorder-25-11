/**
 * Service d'envoi d'emails individuels pour un tracking précis par destinataire
 * 
 * Principe : Pour avoir un tracking fiable comme Mailtrack, chaque destinataire "À"
 * reçoit un email séparé avec son propre pixel de tracking unique.
 */

import { supabase } from '../lib/supabase';

export interface EmailAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface EmailData {
  recipients: Array<{ email: string }>;
  ccRecipients: Array<{ email: string }>;
  bccRecipients: Array<{ email: string }>;
  subject: string;
  htmlBody: string;
  textBody: string;
  attachments: EmailAttachment[];
}

interface SendResult {
  success: boolean;
  totalSent: number;
  failed: string[];
  trackingId: string;
  historyIds: string[];
}

/**
 * Envoie un email individuellement à chaque destinataire "À" avec son pixel unique
 * Les CC reçoivent un seul email groupé
 */
export async function sendIndividualEmails(
  emailData: EmailData,
  emailMethod: 'smtp' | 'gmail' | 'local',
  meetingId?: string,
  userId?: string
): Promise<SendResult> {
  console.log('📧 individualEmailSender - méthode reçue:', emailMethod);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Non authentifié');
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const trackingId = crypto.randomUUID();
  
  const toEmails = emailData.recipients.map(r => r.email.trim()).filter(Boolean);
  const ccEmails = emailData.ccRecipients.map(r => r.email.trim()).filter(Boolean);
  const bccEmails = emailData.bccRecipients.map(r => r.email.trim()).filter(Boolean);
  
  const failed: string[] = [];
  const historyIds: string[] = [];
  
  // Préparer les pièces jointes une seule fois
  const attachmentsFormatted = await prepareAttachments(emailData.attachments);
  const attachmentsSize = calculateAttachmentsSize(attachmentsFormatted);

  // 1. Envoyer individuellement à chaque destinataire "À"
  for (const toEmail of toEmails) {
    try {
      // Créer un pixel unique pour CE destinataire
      const pixelUrl = `${supabaseUrl}/functions/v1/email-open-tracker?id=${trackingId}&recipient=${encodeURIComponent(toEmail)}`;
      const trackingPixel = `<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
      
      const htmlWithTracking = emailData.htmlBody.includes('</body>')
        ? emailData.htmlBody.replace('</body>', `${trackingPixel}</body>`)
        : `${emailData.htmlBody}\n${trackingPixel}`;

      // Envoyer l'email
      const result = await sendSingleEmail({
        to: [toEmail],
        cc: ccEmails, // Les CC sont visibles pour tous
        bcc: bccEmails,
        subject: emailData.subject,
        htmlBody: htmlWithTracking,
        textBody: emailData.textBody,
        attachments: attachmentsFormatted,
        method: emailMethod,
        session,
      });

      // Enregistrer dans l'historique
      const { data: historyData } = await supabase.from('email_history').insert({
        user_id: session.user.id,
        meeting_id: meetingId || null,
        recipients: toEmail, // Un seul destinataire principal
        cc_recipients: ccEmails.length > 0 ? ccEmails.join(', ') : null,
        subject: emailData.subject,
        html_body: htmlWithTracking,
        method: emailMethod,
        attachments_count: emailData.attachments.length,
        total_attachments_size: Math.round(attachmentsSize),
        status: 'sent',
        tracking_id: trackingId,
        message_id: result.messageId || null,
        thread_id: result.threadId || null,
      }).select('id').single();

      if (historyData) {
        historyIds.push(historyData.id);
      }

      console.log(`✅ Email envoyé à ${toEmail}`);
    } catch (error: any) {
      console.error(`❌ Erreur envoi à ${toEmail}:`, error);
      failed.push(toEmail);
      
      // Enregistrer l'échec
      await supabase.from('email_history').insert({
        user_id: session.user.id,
        meeting_id: meetingId || null,
        recipients: toEmail,
        subject: emailData.subject,
        html_body: emailData.htmlBody,
        method: emailMethod,
        attachments_count: emailData.attachments.length,
        status: 'failed',
        error_message: error.message,
        tracking_id: trackingId,
      });
    }
  }

  return {
    success: failed.length === 0,
    totalSent: toEmails.length - failed.length,
    failed,
    trackingId,
    historyIds,
  };
}

async function prepareAttachments(attachments: EmailAttachment[]) {
  return Promise.all(attachments.map(async (att) => {
    try {
      const response = await fetch(att.url);
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          } else {
            reject(new Error('FileReader result is null'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });

      return {
        filename: att.name,
        content: base64,
        contentType: att.type || blob.type || 'application/octet-stream',
      };
    } catch (error) {
      console.error(`Erreur conversion ${att.name}:`, error);
      return null;
    }
  })).then(results => results.filter(a => a !== null));
}

function calculateAttachmentsSize(attachments: any[]): number {
  return attachments.reduce((sum, att: any) => {
    return sum + ((att.content.length * 3) / 4); // base64 to bytes
  }, 0);
}

interface SendSingleEmailParams {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  htmlBody: string;
  textBody: string;
  attachments: any[];
  method: 'smtp' | 'gmail' | 'local';
  session: any;
}

async function sendSingleEmail(params: SendSingleEmailParams): Promise<{ messageId?: string; threadId?: string }> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  console.log('📤 sendSingleEmail - méthode utilisée:', params.method);

  if (params.method === 'smtp') {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email-smtp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: params.session.user.id,
        to: params.to,
        cc: params.cc,
        bcc: params.bcc,
        subject: params.subject,
        htmlBody: params.htmlBody,
        textBody: params.textBody,
        attachments: params.attachments,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Erreur lors de l\'envoi SMTP');
    }

    return { messageId: result.messageId };
  } else if (params.method === 'gmail') {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email-gmail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${params.session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to.join(', '),
        cc: params.cc.join(', '),
        bcc: params.bcc.join(', '),
        subject: params.subject,
        html: params.htmlBody,
        attachments: params.attachments,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Erreur lors de l\'envoi Gmail');
    }

    return { messageId: result.messageId, threadId: result.threadId };
  } else {
    // Local client
    const mailtoLink = `mailto:${params.to.join(',')}?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(params.textBody)}${params.cc.length > 0 ? `&cc=${encodeURIComponent(params.cc.join(','))}` : ''}`;
    window.location.href = mailtoLink;
    return {};
  }
}

