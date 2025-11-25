// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PIXEL_DATA = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
  0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
  0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
]);

const headers = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Content-Type": "image/png",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function getClientIp(req: Request) {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    null
  );
}

Deno.serve(async (req) => {
  if (req.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "GET") {
    return new Response("", { status: 405, headers });
  }

  const url = new URL(req.url);
  const trackingId = url.searchParams.get("id");
  const recipient = url.searchParams.get("recipient");
  const normalizedRecipient = recipient ? recipient.trim().toLowerCase() : null;

  if (!trackingId) {
    return new Response(PIXEL_DATA, { status: 200, headers });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Chercher l'email correspondant au tracking_id ET au recipient si fourni
    let query = supabase
      .from("email_history")
      .select("id, first_opened_at, sent_at, recipients")
      .eq("tracking_id", trackingId);

    // Si on a un recipient, chercher l'email spécifique à ce destinataire
    if (normalizedRecipient) {
      query = query.ilike("recipients", `%${normalizedRecipient}%`);
    }

    const { data: historyList, error } = await query.order("sent_at", { ascending: false });

    if (error || !historyList || historyList.length === 0) {
      console.error("Tracking id not found", trackingId, error);
      return new Response(PIXEL_DATA, { status: 200, headers });
    }

    // Prendre le premier résultat (le plus récent si plusieurs)
    const history = historyList[0];

    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;

    // Filtrer les bots et scanners connus (liste étendue pour meilleure détection)
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scan/i,
      /check/i,
      /monitor/i,
      /preview/i,
      /prerender/i,
      /validator/i,
      /fetcher/i,
      /googleimageproxy/i,      // Gmail proxy d'images
      /google-proxy/i,
      /yahoo.*slurp/i,
      /outlook/i,               // Outlook preview
      /microsoft.*office/i,
      /ms-office/i,
      /windows-mail/i,
      /mailchimp/i,
      /sendgrid/i,
      /mailgun/i,
      /postmark/i,
      /sparkpost/i,
      /amazonses/i,
      /barracuda/i,             // Security scanners
      /proofpoint/i,
      /mimecast/i,
      /messagelabs/i,
      /websense/i,
      /bluecoat/i,
      /fortinet/i,
      /sophos/i,
      /symantec/i,
      /mcafee/i,
      /kaspersky/i,
      /antivirus/i,
      /security/i,
      /safelinks\.protection/i, // Microsoft SafeLinks
      /url-protection/i,
      /link-protection/i,
    ];

    const isSuspicious = userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent));

    // Vérifier le délai depuis l'envoi
    // Réduit à 5 secondes car la détection par user-agent est maintenant plus robuste
    // Les vrais humains prennent au moins quelques secondes pour ouvrir un email
    const sentAt = history.sent_at ? new Date(history.sent_at).getTime() : 0;
    const now = Date.now();
    const timeSinceSent = (now - sentAt) / 1000; // en secondes
    const MIN_DELAY_SECONDS = 5;

    // Ouverture suspecte = trop rapide ET pas de user-agent reconnaissable comme navigateur
    const isKnownBrowser = userAgent && (
      /chrome/i.test(userAgent) ||
      /firefox/i.test(userAgent) ||
      /safari/i.test(userAgent) ||
      /edge/i.test(userAgent) ||
      /opera/i.test(userAgent) ||
      /mobile/i.test(userAgent)
    );

    // On ignore seulement si:
    // 1. C'est un bot/scanner connu
    // 2. OU c'est trop rapide ET ce n'est pas un navigateur connu
    const isTooEarly = sentAt > 0 && timeSinceSent < MIN_DELAY_SECONDS && !isKnownBrowser;

    if (isSuspicious) {
      console.log(`🤖 Suspicious user agent ignored: ${userAgent}`);
      return new Response(PIXEL_DATA, { status: 200, headers });
    }

    if (isTooEarly) {
      console.log(`⏰ Email opened too soon (${timeSinceSent.toFixed(1)}s) with unknown agent, likely a scanner`);
      return new Response(PIXEL_DATA, { status: 200, headers });
    }

    if (!history.first_opened_at) {
      console.log(`✅ Valid email open tracked (${timeSinceSent.toFixed(1)}s after send)`);
      await supabase
        .from("email_history")
        .update({
          first_opened_at: new Date().toISOString(),
          first_opened_recipient: recipient,
        })
        .eq("id", history.id);
    }

    // Enregistrer CHAQUE ouverture (comme Mailtrack)
    // On enregistre toutes les ouvertures pour avoir un historique complet
    if (!isSuspicious && !isTooEarly) {
      console.log(`📬 Recording open event for ${normalizedRecipient || 'unknown'}`);
      await supabase.from("email_open_events").insert({
        email_history_id: history.id,
        recipient_email: normalizedRecipient,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      // Mettre à jour le compteur d'ouvertures sur email_history
      await supabase.rpc('increment_open_count', { history_id: history.id });
    }
  } catch (err) {
    console.error("Error tracking email open", err);
  }

  return new Response(PIXEL_DATA, { status: 200, headers });
});

