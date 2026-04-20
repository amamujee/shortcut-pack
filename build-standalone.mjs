import fs from "node:fs";
import path from "node:path";

const root = "/Users/aadil/Documents/textshortcut";
const sourceHtmlPath = path.join(root, "index.source.html");
const outputHtmlPath = path.join(root, "index.html");
const stylesPath = path.join(root, "styles.css");
const starterDataPath = path.join(root, "starter-pack.cjs");
const appJsPath = path.join(root, "app.js");

const sourceHtml = fs.readFileSync(sourceHtmlPath, "utf8");
const styles = fs.readFileSync(stylesPath, "utf8");
const starterData = fs.readFileSync(starterDataPath, "utf8");
const appJs = fs.readFileSync(appJsPath, "utf8");

const html = sourceHtml
  .replace(
    '<link rel="stylesheet" href="./styles.css" />',
    `<style>\n${styles}\n</style>`,
  )
  .replace(
    '    <script src="./starter-pack.cjs"></script>\n    <script src="./app.js"></script>',
    `    <script>\n${starterData}\n</script>\n    <script>\n${appJs}\n</script>`,
  );

fs.writeFileSync(outputHtmlPath, html);
console.log(`Wrote ${outputHtmlPath}`);
