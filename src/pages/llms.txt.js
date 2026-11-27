import { buildSite } from "../lib/site.mjs";
// llms.txt: a plain guide to the site for AI search tools, built from the finished pages so it always matches them.
const LLMS_SECTIONS = [["features", "Features"], ["industry-news", "Industry news"], ["reports", "Reports"], ["research", "Research areas"]];
export function GET() {
  const { listed, address, pages, indexed } = buildSite();
  if (!indexed) return new Response(null, { status: 404 });
  const meta = (html, re) => { const m = re.exec(html); return m ? m[1].replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim() : ""; };
  const titleOf = (h) => meta(h, /<title>([^<]*)<\/title>/).replace(/ \| [^|]*$/, "");
  const descOf = (h) => meta(h, /<meta name="description" content="([^"]*)"/);
  const home = pages.find((p) => p.path === "index.html");
  const lines = ["# " + titleOf(home.html), "", "> " + descOf(home.html), ""];
  for (const [folder, heading] of LLMS_SECTIONS) {
    const items = listed.filter((p) => p.path.startsWith(folder + "/") && p.path !== folder + "/index.html" && !/<meta name="robots" content="noindex/.test(p.html));
    if (!items.length) continue;
    lines.push("## " + heading, "");
    for (const p of items) { const d = descOf(p.html); lines.push("- [" + titleOf(p.html) + "](" + address + p.url + ")" + (d ? ": " + d : "")); }
    lines.push("");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain" } });
}
