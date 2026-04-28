import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
import tailwindPrimeui from "tailwindcss-primeui";
import tailwindCaido from "@caido/tailwindcss";
import prefixwrap from "postcss-prefixwrap";
import path from "path";

const id = "hackvertor";

export default {
  id,
  name: "Hackvertor",
  version: "0.3.0",
  description: "Tag-based data transformation and encoding toolkit",
  author: {
    name: "p4st1s"
  },
  watch: {
    port: 1337
  },
  plugins: [
    {
      kind: "backend",
      id: "backend",
      root: "./packages/backend"
    },
    {
      kind: "frontend",
      id: "frontend",
      root: "./packages/frontend",
      vite: {
        plugins: [vue()],
        build: {
          rollupOptions: {
            external: ["@caido/frontend-sdk", "vue"],
          },
        },
        resolve: {
          alias: [
            {
              find: "@",
              replacement: path.resolve(__dirname, "packages/frontend/src"),
            },
          ],
        },
        css: {
          postcss: {
            plugins: [
              prefixwrap(`#plugin--${id}`),
              tailwindcss({
                corePlugins: {
                  preflight: false,
                },
                content: [
                  "./packages/frontend/src/**/*.{vue,ts}",
                  "./node_modules/@caido/primevue/dist/primevue.mjs",
                ],
                darkMode: ["selector", '[data-mode="dark"]'],
                plugins: [
                  tailwindPrimeui,
                  tailwindCaido,
                ],
              }),
            ],
          },
        },
      }
    }
  ]
};
