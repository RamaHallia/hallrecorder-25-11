import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  code: string;
  newPassword: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, code, newPassword }: RequestBody = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Email, code et nouveau mot de passe requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 6 caractères" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: resetData, error: resetError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .single();

    if (resetError || !resetData) {
      return new Response(
        JSON.stringify({ error: "Code invalide ou expiré" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const expiresAt = new Date(resetData.expires_at);

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Code expiré" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
      throw userError;
    }

    const user = userData.users.find((u) => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    const { error: markUsedError } = await supabase
      .from("password_reset_codes")
      .update({ used: true })
      .eq("id", resetData.id);

    if (markUsedError) {
      console.error("Erreur marquage code utilisé:", markUsedError);
    }

    console.log(`Mot de passe réinitialisé pour ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mot de passe réinitialisé avec succès",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Erreur verify-reset-code:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erreur serveur" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
