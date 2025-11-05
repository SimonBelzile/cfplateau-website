import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import optimizer from "astro-google-fonts-optimizer";

export default defineConfig({
  site: "https://cfplateau-website-production.up.railway.app",
  output: "static",
  output: 'static',
  integrations: [
    tailwind(),
    optimizer(),            // OK après tailwind
    // … d’autres intégrations si besoin
  ],
  vite: {
      ssr: {
        noExternal: ['astro-google-fonts-optimizer'],  // ← important
      },
    },
});
