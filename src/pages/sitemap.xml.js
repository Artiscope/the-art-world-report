import { buildSite } from "../lib/site.mjs";
export function GET() {
  const { listed, address, indexed } = buildSite();
  if (!indexed) return new Response(null, { status: 404 });
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    listed.map((p) => "<url><loc>" + address + p.url + "</loc>" + (p.lastmod ? "<lastmod>" + p.lastmod + "</lastmod>" : "") + "</url>\n").join("") + "</urlset>\n";
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
