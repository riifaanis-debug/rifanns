import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateRegistrationOptions } from "https://esm.sh/@simplewebauthn/server@10.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, userName, rpID } = await req.json();
    if (!userId || !userName || !rpID) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get existing credentials to exclude them
    const { data: existingCreds } = await supabase
      .from("webauthn_credentials")
      .select("credential_id, transports")
      .eq("user_id", userId);

    const options = await generateRegistrationOptions({
      rpName: "Rifans Finance",
      rpID,
      userID: new TextEncoder().encode(userId),
      userName,
      attestationType: "none",
      excludeCredentials: (existingCreds || []).map((c: any) => ({
        id: c.credential_id,
        transports: c.transports || [],
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Store challenge
    await supabase.from("webauthn_challenges").insert({
      challenge: options.challenge,
      user_id: userId,
      type: "registration",
    });

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("register-options error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
