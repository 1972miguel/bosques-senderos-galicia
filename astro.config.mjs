// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://senderosegalizia.gal",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("404"),
      changefreq: "weekly",
      priority: 0.7,
      entryLimit: 45000,
      serialize(item) {
        // Custom priority based on page type
        if (item.url.includes("/rutas/")) item.priority = 0.8;
        if (item.url.includes("/especies/")) item.priority = 0.75;
        if (item.url.includes("/ecosistemas/")) item.priority = 0.75;
        if (item.url === "https://senderosegalizia.gal/") item.priority = 1.0;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "Sendeiros e Bosques de Galicia",
          short_name: "Sendeiros",
          description: "Rutas con ficha ecolóxica do ecosistema galego",
          theme_color: "#1a2e1a",
          background_color: "#1a2e1a",
          display: "standalone",
          scope: "/",
          start_url: "/",
          icons: [
            { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
            { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/icons/icon-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{css,js,html,svg,png,jpg,json}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "osm-tiles",
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
});
