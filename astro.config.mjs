// The Art World Report, built with Astro.
// The pages are still drawn by assets/render.js from data/content.json and data/pages.json,
// so Artiscope Digital Home edits and previews the site exactly as before. Astro adds the
// build, the checks on the content, a local preview that reloads as you edit, and the
// smoother page changes. See ASTRO.md.
import fs from "node:fs";
import { defineConfig } from "astro/config";

const content = JSON.parse(fs.readFileSync(new URL("./data/content.json", import.meta.url), "utf8"));

// The site's assets/ folder (shared with the Digital Home template) is copied into public/
// before every build and local preview, so its files keep their addresses under /assets/.
function siteFiles() {
  const copy = () => {
    fs.rmSync("public", { recursive: true, force: true });
    fs.mkdirSync("public", { recursive: true });
    fs.cpSync("assets", "public/assets", { recursive: true });
    fs.writeFileSync("public/.nojekyll", "");
    const host = String(content.site.address || "").replace(/^https:\/\//, "").replace(/\/.*$/, "");
    if (content.site.indexed && host && !/\.github\.io$/.test(host) && host !== "example.org") fs.writeFileSync("public/CNAME", host + "\n");
  };
  return { name: "site-files", hooks: { "astro:config:setup": copy } };
}

export default defineConfig({
  site: content.site.address,
  trailingSlash: "always",
  build: { format: "directory" },
  outDir: "_site",
  integrations: [siteFiles()],
  devToolbar: { enabled: false },
});
