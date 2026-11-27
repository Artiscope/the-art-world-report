# How Astro builds this site

Since 27 November 2026 the site is built with Astro. Nothing about the
pages, their addresses or how they are edited has changed.

- The words still live in `data/content.json` and the page layouts in
  `data/pages.json`. Artiscope Digital Home reads and writes those files
  as before, and its preview still matches the published page, because
  the pages are still drawn by `assets/render.js`.
- `src/content.config.ts` sets the rules each article and research area
  must follow (a search description, sources with working-looking links,
  a known section). A broken entry stops the build with a plain message
  instead of reaching the live site.
- `src/lib/site.mjs` draws every page once and adds two things to the
  head of each: a short cross-fade between pages with the masthead held
  still, and background fetching of a page when a reader rests on its
  link. Browsers that cannot do either simply change page as before.
- `src/pages/` hands out the pages at the same addresses as before, plus
  `sitemap.xml`, `robots.txt`, `llms.txt` and `search/index.json`.
- `astro.config.mjs` copies `assets/` into `public/` before each build,
  so the stylesheet, scripts and logos keep their addresses.

Commands: `npm ci` once, then `npx astro dev` for a local copy that
reloads as you edit, or `npx astro build` to build into `_site`.

`tools/build.mjs` and `assets/render.js` stay the same as the Digital
Home template, so a design change is still made there and copied here.
