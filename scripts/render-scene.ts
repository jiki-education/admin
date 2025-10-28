#!/usr/bin/env tsx

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

const compositionId = process.argv[2] || "example-basic";

async function renderScene() {
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./components/remotion/Root.tsx"),
    // If you have a webpack override, make sure to import it here
    webpackOverride: (config) => config
  });

  const comps = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId
  });

  const composition = comps[0];

  console.debug(`Rendering composition "${compositionId}"...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: `out/${compositionId}.mp4`
  });

  console.debug(`Rendered video saved to out/${compositionId}.mp4`);
}

renderScene().catch((err) => {
  console.error("Error rendering scene:", err);
  process.exit(1);
});
