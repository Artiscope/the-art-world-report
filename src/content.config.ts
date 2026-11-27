// Checks on the site's content. data/content.json stays the one place the words live,
// because Artiscope Digital Home reads and writes it. These rules stop a build if an
// entry is malformed, so a mistake shows up before it reaches the live site.
import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { z } from "astro/zod";

const slug = z.string().regex(/^[a-z0-9][a-z0-9-]{0,80}$/, "a web address of small letters, digits and hyphens");
const fromContent = (key: string) => (text: string) =>
  (JSON.parse(text)[key] || []).map((x: Record<string, unknown>) => ({ ...x, id: x.slug }));

const articles = defineCollection({
  loader: file("data/content.json", { parser: fromContent("articles") }),
  schema: z.object({
    slug,
    title: z.string().min(1),
    kicker: z.string().optional(),
    card: z.string().optional(),
    summary: z.string().optional(),
    description: z.string().min(1, "every article needs a search description"),
    date: z.string().optional(),
    subjects: z.array(z.string()).default([]),
    also: z.array(z.string()).default([]),
    body: z.string().min(1),
    sources: z.array(z.object({ title: z.string().min(1), href: z.string().url(), publisher: z.string().optional(), date: z.string().optional() }).passthrough()).min(1, "every article needs its sources").default([]),
    image: z.string().optional(),
    alt: z.string().optional(),
    credit: z.string().optional(),
    hidden: z.boolean().default(false),
    folder: z.enum(["features", "industry-news", "reports"]).optional(),
    more1: z.string().optional(),
    more2: z.string().optional(),
    more3: z.string().optional(),
  }).passthrough(),
});

const researchAreas = defineCollection({
  loader: file("data/content.json", { parser: fromContent("artists") }),
  schema: z.object({
    slug,
    name: z.string().min(1),
    line: z.string().optional(),
    description: z.string().optional(),
    topics: z.array(z.string()).default([]),
    related: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    hidden: z.boolean().default(false),
  }).passthrough(),
});

export const collections = { articles, researchAreas };
