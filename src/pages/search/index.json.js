import { buildSite } from "../../lib/site.mjs";
// the search page reads this list of every feature, section and research area
export function GET() {
  return new Response(buildSite().site.searchIndex(), { headers: { "Content-Type": "application/json" } });
}
