import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateAuthenticationOptions } from "https://esm.sh/@simplewebauthn/server@10.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { rpID, credentialIds } = await req.json();
    if (!rpID) {
      return new Response(JSON.stringify({ error: "Missing rpID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const allowCredentials = (credentialIds && credentialIds.length > 0)
      ? credentialIds.map((id: string) => ({ id }))
      : undefined;

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      allowCredentials,
    });

    await supabase.from("webauthn_challenges").insert({
      challenge: options.challenge,
      type: "authentication",
    });

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("auth-options error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
