// HubSpot sync: create/update Contact and optionally create a Deal
// Invoked from client after user registration or request submission

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/hubspot';

interface SyncBody {
  action: 'upsert_contact' | 'create_deal' | 'both';
  contact: {
    email?: string;
    phone?: string;
    firstname?: string;
    lastname?: string;
    national_id?: string;
  };
  deal?: {
    dealname: string;
    amount?: number;
    description?: string;
    pipeline?: string;
    dealstage?: string;
  };
}

async function hubspotFetch(path: string, init: RequestInit, lovableKey: string, hubspotKey: string) {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': hubspotKey,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, json, text };
}

async function upsertContact(contact: SyncBody['contact'], lovableKey: string, hubspotKey: string) {
  if (!contact.email && !contact.phone) {
    throw new Error('Contact must have email or phone');
  }

  const properties: Record<string, string> = {};
  if (contact.email) properties.email = contact.email;
  if (contact.phone) properties.phone = contact.phone;
  if (contact.firstname) properties.firstname = contact.firstname;
  if (contact.lastname) properties.lastname = contact.lastname;

  // Search by email first, then by phone
  let existingId: string | null = null;
  const searchKey = contact.email ? 'email' : 'phone';
  const searchVal = contact.email || contact.phone!;

  const search = await hubspotFetch('/crm/v3/objects/contacts/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: searchKey, operator: 'EQ', value: searchVal }] }],
      properties: ['email', 'phone'],
      limit: 1,
    }),
  }, lovableKey, hubspotKey);

  if (search.ok && search.json?.results?.length > 0) {
    existingId = search.json.results[0].id;
  }

  if (existingId) {
    const upd = await hubspotFetch(`/crm/v3/objects/contacts/${existingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    }, lovableKey, hubspotKey);
    if (!upd.ok) throw new Error(`HubSpot update contact failed [${upd.status}]: ${upd.text}`);
    return existingId;
  }

  const cre = await hubspotFetch('/crm/v3/objects/contacts', {
    method: 'POST',
    body: JSON.stringify({ properties }),
  }, lovableKey, hubspotKey);
  if (!cre.ok) throw new Error(`HubSpot create contact failed [${cre.status}]: ${cre.text}`);
  return cre.json.id as string;
}

async function createDeal(
  deal: NonNullable<SyncBody['deal']>,
  contactId: string,
  lovableKey: string,
  hubspotKey: string,
) {
  const properties: Record<string, string> = {
    dealname: deal.dealname,
    pipeline: deal.pipeline || 'default',
    dealstage: deal.dealstage || 'appointmentscheduled',
  };
  if (typeof deal.amount === 'number') properties.amount = String(deal.amount);
  if (deal.description) properties.description = deal.description;

  const res = await hubspotFetch('/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({
      properties,
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }],
        },
      ],
    }),
  }, lovableKey, hubspotKey);

  if (!res.ok) throw new Error(`HubSpot create deal failed [${res.status}]: ${res.text}`);
  return res.json.id as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const HUBSPOT_API_KEY = Deno.env.get('HUBSPOT_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!HUBSPOT_API_KEY) throw new Error('HUBSPOT_API_KEY is not configured');

    const body = (await req.json()) as SyncBody;
    if (!body?.action || !body?.contact) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let contactId: string | null = null;
    let dealId: string | null = null;

    if (body.action === 'upsert_contact' || body.action === 'both') {
      contactId = await upsertContact(body.contact, LOVABLE_API_KEY, HUBSPOT_API_KEY);
    }

    if ((body.action === 'create_deal' || body.action === 'both') && body.deal) {
      if (!contactId) {
        contactId = await upsertContact(body.contact, LOVABLE_API_KEY, HUBSPOT_API_KEY);
      }
      dealId = await createDeal(body.deal, contactId, LOVABLE_API_KEY, HUBSPOT_API_KEY);
    }

    return new Response(JSON.stringify({ success: true, contactId, dealId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('hubspot-sync error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
