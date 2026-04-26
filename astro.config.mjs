import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

import db from "@astrojs/db";

export default defineConfig({
  site: "https://adechlien.blog",
  integrations: [mdx(), sitemap(), tailwind(), db()],
  adapter: vercel(),
});
