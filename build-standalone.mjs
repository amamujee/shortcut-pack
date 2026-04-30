import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const landingSourcePath = path.join(root, "index.source.html");
const landingOutputPath = path.join(root, "index.html");
const generatorSourcePath = path.join(root, "generator.source.html");
const generatorOutputPath = path.join(root, "generator.html");
const generatorStylesPath = path.join(root, "styles.css");
const starterDataPath = path.join(root, "starter-pack.cjs");
const appJsPath = path.join(root, "app.js");
const faviconPath = path.join(root, "favicon.svg");
const importGuideImagePath = path.join(
  root,
  "assets",
  "screenshots",
  "import-text-replacements.png",
);

const landingSource = fs.readFileSync(landingSourcePath, "utf8");
const generatorSource = fs.readFileSync(generatorSourcePath, "utf8");
const generatorStyles = fs.readFileSync(generatorStylesPath, "utf8");
const starterData = fs.readFileSync(starterDataPath, "utf8");
const appJs = fs.readFileSync(appJsPath, "utf8");
const faviconSvg = fs.readFileSync(faviconPath, "utf8");
const importGuideImage = fs.readFileSync(importGuideImagePath);
const faviconDataUri = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
const importGuideImageDataUri = `data:image/png;base64,${importGuideImage.toString("base64")}`;

const generatorHtml = generatorSource
  .replace(
    '<link rel="icon" href="./favicon.svg" type="image/svg+xml" />',
    `<link rel="icon" href="${faviconDataUri}" type="image/svg+xml" />`,
  )
  .replace(
    '<link rel="stylesheet" href="./styles.css" />',
    `<style>\n${generatorStyles}\n</style>`,
  )
  .replace(
    '    <script src="./starter-pack.cjs"></script>\n    <script src="./app.js"></script>',
    `    <script>\n${starterData}\n</script>\n    <script>\n${appJs}\n</script>`,
  )
  .replace(
    './assets/screenshots/import-text-replacements.png',
    importGuideImageDataUri,
  );

const landingHtml = landingSource
  .replace(
    '<link rel="icon" href="./favicon.svg" type="image/svg+xml" />',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml" />',
  )
  .replace(
    '"__OFFLINE_BUILDER_BASE64__"',
    JSON.stringify(Buffer.from(generatorHtml, "utf8").toString("base64")),
  );

fs.writeFileSync(landingOutputPath, landingHtml);
fs.writeFileSync(generatorOutputPath, generatorHtml);
console.log(`Wrote ${landingOutputPath}`);
console.log(`Wrote ${generatorOutputPath}`);
