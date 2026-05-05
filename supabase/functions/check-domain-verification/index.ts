const EXPECTED = "f611e98333bbd3a199cf29cfe01bce776a08e40996bfdf6bc8816e9c717c0cdb";
const TARGETS = ["https://rifanss.com", "https://www.rifanss.com"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const results: Array<Record<string, unknown>> = [];
  for (const url of TARGETS) {
    try {
      const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
      const html = await res.text();
      const match = html.match(/<meta[^>]+name=["']domain-verification["'][^>]+content=["']([^"']+)["']/i);
      const found = match?.[1] ?? null;
      results.push({
        url,
        status: res.status,
        found,
        matches: found === EXPECTED,
        reason: !found
          ? "لم يتم العثور على وسم domain-verification في الصفحة المنشورة."
          : found !== EXPECTED
          ? `الرمز الموجود قديم (${found.slice(0, 12)}...). يجب إعادة النشر.`
          : "الرمز الصحيح موجود ✅",
      });
    } catch (e) {
      results.push({ url, error: String(e) });
    }
  }

  return new Response(
    JSON.stringify({ expected: EXPECTED, results }, null, 2),
    { headers: { ...cors, "content-type": "application/json" } }
  );
});
