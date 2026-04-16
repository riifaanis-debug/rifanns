import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyAuthenticationResponse } from "https://esm.sh/@simplewebauthn/server@10.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { response, expectedOrigin, rpID } = await req.json();
    if (!response || !expectedOrigin || !rpID) {
      return new Response(JSON.stringify({ success: false, error: "Missing parameters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find credential by id
    const credentialId = response.id;
    const { data: creds } = await supabase
      .from("webauthn_credentials")
      .select("*")
      .eq("credential_id", credentialId)
      .limit(1);

    if (!creds || creds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Credential not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cred = creds[0];

    // Find latest auth challenge
    const { data: challenges } = await supabase
      .from("webauthn_challenges")
      .select("*")
      .eq("type", "authentication")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(5);

    if (!challenges || challenges.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "Challenge expired" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode public key from base64
    const publicKeyBytes = Uint8Array.from(atob(cred.public_key), (c) => c.charCodeAt(0));

    let verification;
    let usedChallenge;
    for (const ch of challenges) {
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge: ch.challenge,
          expectedOrigin,
          expectedRPID: rpID,
          credential: {
            id: cred.credential_id,
            publicKey: publicKeyBytes,
            counter: Number(cred.counter),
            transports: cred.transports || [],
          },
          requireUserVerification: false,
        });
        if (verification.verified) {
          usedChallenge = ch;
          break;
        }
      } catch (_) {
        continue;
      }
    }

    if (!verification?.verified) {
      return new Response(JSON.stringify({ success: false, error: "Verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update counter & last_used_at
    await supabase
      .from("webauthn_credentials")
      .update({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", cred.id);

    if (usedChallenge) {
      await supabase.from("webauthn_challenges").delete().eq("id", usedChallenge.id);
    }

    // Fetch user data
    const { data: users } = await supabase
      .from("app_users")
      .select("id, full_name, email, phone, national_id, role")
      .eq("id", cred.user_id)
      .limit(1);

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = users[0];
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          name: user.full_name,
          email: user.email,
          phone: user.phone,
          national_id: user.national_id,
          role: user.role,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("auth-verify error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
