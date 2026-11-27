// Draws every page of the site once, for Astro's routes to hand out.
// The drawing is done by assets/render.js, the same code Artiscope Digital Home uses for its
// preview, so the published page and the preview always match. The checks below are the
// ones tools/build.mjs makes; they stop a build before a bad edit can blank the site.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = process.cwd();
const R = createRequire(path.join(ROOT, "package.json"))(path.join(ROOT, "assets", "render.js"));
const read = (p) => {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8")); }
  catch (e) { throw new Error(p + " could not be read: " + e.message); }
};
const fail = (msg) => { throw new Error(msg); };

const KINDS = ["announcement", "columns", "space", "quote", "faq", "button",
  "picture-banner", "slideshow", "gallery", "logo-row", "picture", "text-picture",
  "artworks", "exhibitions", "career", "press", "signup", "visit", "contact-form", "signup-popup",
  "awr-front", "awr-opening", "awr-features", "awr-cards", "awr-briefing", "awr-links", "awr-text",
  "awr-quiz"];

function checkPages(content, pages) {
  for (const key of ["header", "footer"]) {
    const part = (pages.shared || {})[key];
    if (!part || typeof part !== "object" || typeof part.settings !== "object") fail("data/pages.json must have the shared part '" + key + "' with settings.");
  }
  if (!pages.pages || !pages.pages.home) fail("data/pages.json must have the home page.");
  for (const [key, pg] of Object.entries(pages.pages)) {
    if (!pg || !Array.isArray(pg.sections) || !String(pg.path || "").endsWith("index.html")) fail("The page '" + key + "' in data/pages.json needs a path ending in index.html and a list of sections.");
    if (pg.path.includes("..") || pg.path.startsWith("/")) fail("The page '" + key + "' has a path that is not allowed.");
    const seen = new Set();
    for (const sec of pg.sections) {
      if (!sec || !KINDS.includes(sec.type)) fail("The page '" + key + "' has a section of a kind the site cannot draw: " + JSON.stringify(sec && sec.type));
      if (sec.type === "signup-popup") fail("A sign-up popup goes in the Popups group, not on a page.");
      const sid = String(sec.id || "");
      if (!/^[A-Za-z0-9_-]+$/.test(sid) || seen.has(sid)) fail("Every section on page '" + key + "' needs its own id of letters, digits and hyphens: " + JSON.stringify(sid));
      seen.add(sid);
      if (sec.settings != null && typeof sec.settings !== "object") fail("The settings of section '" + sid + "' on page '" + key + "' must be a list of fields.");
    }
  }
  const templates = pages.templates || {};
  if (typeof templates !== "object" || Array.isArray(templates)) fail("The templates in data/pages.json must be grouped by kind of page.");
  for (const [kind, all] of Object.entries(templates)) {
    if (!["article", "artist"].includes(kind) || !all || typeof all !== "object" || !all.default) fail("Templates are for articles and artists, and each kind needs a default: " + JSON.stringify(kind));
    for (const [tid, t] of Object.entries(all)) {
      const secs = t && t.sections;
      if (!Array.isArray(secs) || secs.filter((x) => x && x.type === "main").length !== 1) fail("The template '" + tid + "' needs a list of sections with the page's own content in it once.");
      for (const sec of secs) {
        if (!sec || (sec.type !== "main" && (!KINDS.includes(sec.type) || sec.type === "signup-popup"))) fail("The template '" + tid + "' has a section of a kind the site cannot draw.");
        if (sec.type !== "main" && !/^t-[a-z0-9-]+$/.test(String(sec.id || ""))) fail("Every section in a template needs its own id starting t-: " + JSON.stringify(sec.id));
      }
    }
  }
  if (pages.words != null && (typeof pages.words !== "object" || Array.isArray(pages.words) || Object.values(pages.words).some((v) => typeof v !== "string"))) fail("The changed words in data/pages.json must be a list of plain words.");
  if (pages.assign != null && (typeof pages.assign !== "object" || Array.isArray(pages.assign))) fail("The templates chosen for articles and artists must be listed by kind.");
  const gseen = new Set();
  for (const where of ["top", "popups", "bottom"]) {
    for (const sec of ((pages.groups || {})[where] || [])) {
      if (!sec || !KINDS.includes(sec.type)) fail("A section shared by every page is of a kind the site cannot draw: " + JSON.stringify(sec && sec.type));
      if ((where === "popups") !== (sec.type === "signup-popup")) fail("Only sign-up popups go in the Popups group, and they go nowhere else.");
      const sid = String(sec.id || "");
      if (!/^every-[a-z0-9-]+$/.test(sid) || gseen.has(sid)) fail("Every shared section needs its own id starting every-: " + JSON.stringify(sid));
      gseen.add(sid);
    }
  }
  // links between entries: an article's research areas and "more" picks must exist
  const areas = new Set((content.artists || []).map((x) => x.slug));
  const arts = new Set((content.articles || []).map((x) => x.slug));
  for (const a of content.articles || []) {
    for (const s of a.subjects || []) if (!areas.has(s)) fail("The article '" + a.slug + "' is filed under a research area that does not exist: " + s);
    for (const k of ["more1", "more2", "more3"]) if (a[k] && !arts.has(a[k])) fail("The article '" + a.slug + "' points " + k + " at an article that does not exist: " + a[k]);
  }
}

function themeHead(theme) {
  let out = "";
  for (const link of theme.font_links || []) {
    if (typeof link === "string" && link.startsWith("https://fonts.googleapis.com/css2?") && !/["<>\s]/.test(link)) out += '<link href="' + link.replace(/&/g, "&amp;") + '" rel="stylesheet">\n';
  }
  const css = theme.css || "";
  if (css && /^:root\{[^<>{}]*\}$/.test(css)) out += '<style id="theme">' + css + "</style>\n";
  const rules = theme.rules || "";
  if (typeof rules === "string" && rules.trim() && !rules.includes("<")) out += '<style id="theme-rules">\n' + rules + "\n</style>\n";
  return out;
}

// The smoother feel, added to the head of every page:
// - a short cross-fade between pages, with the masthead held still (browsers that cannot do
//   this simply change page as before, and it is switched off for readers who ask for less motion);
// - pages fetched in the background when a reader rests on a link, so the next page opens at once.
//   Only fetched, never run, so visitor statistics are not counted for pages nobody opened.
const FEEL = '<style id="page-changes">@view-transition{navigation:auto}.site-header{view-transition-name:masthead}' +
  "::view-transition-old(root),::view-transition-new(root){animation-duration:.2s}" +
  "@media (prefers-reduced-motion:reduce){@view-transition{navigation:none}}</style>\n" +
  '<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/preview/*"}}]},"eagerness":"moderate"}]}</script>\n';
const withFeel = (html) => html.replace("</head>", FEEL + "</head>");

let cache = null;
export function buildSite() {
  if (cache) return cache;
  const content = read("data/content.json"), pages = read("data/pages.json");
  const theme = fs.existsSync(path.join(ROOT, "data", "theme.json")) ? read("data/theme.json") : {};
  checkPages(content, pages);
  const extras = { social: theme.social && typeof theme.social === "object" ? theme.social : {}, favicon: typeof theme.favicon === "string" ? theme.favicon : "" };
  const D = R.fromFiles(content);
  const site = R.Site(D, pages, themeHead(theme), extras);
  const address = R.addressOf(D);
  const all = site.all();
  const forwards = site.forwards();
  const taken = new Set(all.map((p) => p.path));
  for (const f of forwards) if (taken.has(f.path)) fail("An old address is also a page of the site: " + f.path);
  const pages_ = all.concat(forwards).map((p) => ({ ...p, html: withFeel(p.html) }));
  const listed = all.filter((p) => p.path !== "404.html" && !p.unlisted);
  cache = { D, site, address, pages: pages_, listed, indexed: !!D.site.indexed };
  return cache;
}

// "features/x/index.html" -> "features/x"; the home page -> undefined
export const routeOf = (p) => (p === "index.html" ? undefined : p.replace(/\/index\.html$/, ""));
