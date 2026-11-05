// Vercel serverless function. The browser calls /api/tmdb?path=/movie/popular&page=1
// and this adds the TMDB key on the server, so the key never reaches the visitor.
// Set TMDB_API_KEY in Vercel: Project Settings > Environment Variables.

const ALLOWED = [
  /^\/configuration$/,
  /^\/trending\/all\/week$/,
  /^\/(movie|tv)\/popular$/,
  /^\/discover\/(movie|tv)$/,
  /^\/search\/multi$/,
  /^\/(movie|tv)\/\d+$/,
  /^\/tv\/\d+\/season\/\d+$/
];

const first = v => String(Array.isArray(v) ? v[0] : (v ?? ""));

module.exports = async (req, res) => {
  const key = process.env.TMDB_API_KEY;
  if (!key) return res.status(500).json({ error: "TMDB_API_KEY is not set" });
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });

  const query = req.query || {};
  const path = first(query.path);
  if (!ALLOWED.some(rx => rx.test(path))) return res.status(400).json({ error: "Path not allowed" });

  const url = new URL("https://api.themoviedb.org/3" + path);
  for (const [k, v] of Object.entries(query)) {
    if (k === "path" || k === "api_key") continue;
    url.searchParams.set(k, first(v));
  }

  // Works with either the v3 API key or the v4 "API Read Access Token".
  const headers = { Accept: "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key;
  else url.searchParams.set("api_key", key);

  try {
    const upstream = await fetch(url, { headers });
    const body = await upstream.text();
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", upstream.ok ? "public, s-maxage=600, stale-while-revalidate=1200" : "no-store");
    res.status(upstream.status).send(body);
  } catch {
    res.status(502).json({ error: "TMDB is unreachable" });
  }
};
