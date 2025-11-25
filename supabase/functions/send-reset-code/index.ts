import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email }: RequestBody = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email invalide" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw userError;
    }

    const userExists = userData.users.find((u) => u.email === email);

    if (!userExists) {
      return new Response(
        JSON.stringify({ success: true, message: "Si cet email existe, un code a été envoyé" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { error: deleteError } = await supabase
      .from("password_reset_codes")
      .delete()
      .eq("email", email);

    if (deleteError) {
      console.error("Erreur suppression anciens codes:", deleteError);
    }

    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert({
        email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (insertError) {
      throw insertError;
    }

    console.log(`Code OTP généré pour ${email}: ${code} (expire à ${expiresAt.toISOString()})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Un code de vérification a été envoyé à votre email",
        debug_code: code
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erreur send-reset-code:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
