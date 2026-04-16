const esbuild = require("esbuild");
const watch = process.argv.includes("--watch");

const ctx = esbuild.context({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["caido:plugin", "caido:utils", "crypto", "buffer"],
  outfile: "../../dist/backend.js",
  minify: false,
});

ctx.then(async (c) => {
  if (watch) {
    await c.watch();
    console.log("Watching for changes...");
  } else {
    await c.rebuild();
    await c.dispose();
    console.log("Backend build complete.");
  }
});
