# The Art World Report

theartworldreport.com, run from Artiscope Digital Home.

The pages are drawn from the data files on every publish:

- `data/content.json`: the site's details, its features (with the news and
  reports) and its research areas.
- `data/pages.json`: the pages, their sections, the menu bar and footer.
- `data/theme.json`: colours and typefaces.

`python3 tools/build.py _site` builds the whole site into `_site`. The
design (`assets/render.js`, `assets/site.css`, `assets/site.js`,
`tools/build.mjs`) is the console's The Art World Report template.

`assets/vendor/lenis.mjs` is a copy of Lenis 1.3.19 (MIT licence), the
smooth scrolling, kept in the site so nothing loads from another company.

The instructions for the site's agent are in `CLAUDE.md`.
