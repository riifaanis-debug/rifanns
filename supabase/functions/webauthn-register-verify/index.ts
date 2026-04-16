import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyRegistrationResponse } from "https://esm.sh/@simplewebauthn/server@10.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, response, expectedOrigin, rpID, deviceName } = await req.json();
    if (!userId || !response || !expectedOrigin || !rpID) {
      return new Response(JSON.stringify({ success: false, error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Retrieve & remove challenge
    const { data: challenges } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("type", "registration")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (!challenges || challenges.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Challenge not found or expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedChallenge = challenges[0].challenge;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return new Response(JSON.stringify({ success: false, error: "Verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Store credential
    const { error: insertError } = await supabase.from("webauthn_credentials").insert({
      user_id: userId,
      credential_id: credential.id,
      public_key: btoa(String.fromCharCode(...credential.publicKey)),
      counter: credential.counter,
      transports: credential.transports || [],
      device_name: deviceName || "جهاز غير معروف",
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ success: false, error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cleanup challenge
    await supabase.from("webauthn_challenges").delete().eq("id", challenges[0].id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("register-verify error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
