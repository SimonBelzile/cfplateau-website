import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://cfplateau-website-production.up.railway.app",
  output: "static",
  output: 'static',
  integrations: [
    tailwind(),
  ],
});
