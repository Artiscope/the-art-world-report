import { buildSite } from "../lib/site.mjs";
// Who may read the site. Everyone is welcome; the search engines and the AI search tools that
// link back to their sources are also named, so there is no doubt they are allowed in.
const ROBOTS = "User-agent: *\nAllow: /\n\nUser-agent: Googlebot\nUser-agent: Bingbot\nUser-agent: OAI-SearchBot\nUser-agent: ChatGPT-User\nUser-agent: PerplexityBot\nUser-agent: Perplexity-User\nUser-agent: Claude-SearchBot\nUser-agent: Claude-User\nUser-agent: Applebot\nUser-agent: DuckDuckBot\nAllow: /\n";
export function GET() {
  const { address, indexed } = buildSite();
  // Until its own web address is connected, the site asks search engines to stay away.
  const body = indexed ? ROBOTS + "\nSitemap: " + address + "sitemap.xml\n" : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
