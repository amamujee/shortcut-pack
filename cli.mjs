#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { DEFAULT_CLI_PREFIX, buildGenericStarterEntries, groupByCategory } from "./starter-pack.mjs";

const [, , command, ...args] = process.argv;

function printUsage() {
  console.log(`ai-shortcuts

Usage:
  node cli.mjs setup
  node cli.mjs list [--prefix=@@]
  node cli.mjs generate [--format=text|markdown|json] [--prefix=@@]
  node cli.mjs doctor
`);
}

function getOption(name, fallback) {
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

function formatText(entries) {
  const groups = groupByCategory(entries);
  return Object.entries(groups)
    .map(([category, items]) => {
      const body = items.map((item) => `  ${item.shortcut} -> ${item.phrase}`).join("\n");
      return `${category}\n${body}`;
    })
    .join("\n\n");
}

function formatMarkdown(entries) {
  const groups = groupByCategory(entries);
  return Object.entries(groups)
    .map(([category, items]) => {
      const body = items
        .map((item) => `- \`${item.shortcut}\` -> ${item.phrase.replaceAll("\n", "<br />")}`)
        .join("\n");
      return `## ${category}\n${body}`;
    })
    .join("\n\n");
}

function runSetup() {
  console.log("Open Keyboard settings, back up your current replacements, then import or enter your shortcuts.");
  console.log("Recommended naming style: use a memorable prefix like @@ or > to avoid accidental triggers.");

  if (process.platform !== "darwin") {
    console.log("This helper is Mac-first. On macOS, go to System Settings -> Keyboard -> Text Replacements.");
    console.log("Before importing, select your current replacements and drag them to Finder as a backup.");
    return;
  }

  try {
    execFileSync("open", ["x-apple.systempreferences:com.apple.Keyboard-Settings.extension"], {
      stdio: "ignore",
    });
    console.log("Opened macOS Keyboard settings.");
  } catch {
    console.log("Could not open the settings pane automatically.");
    console.log("Open System Settings -> Keyboard -> Text Replacements manually.");
  }

  console.log("Before importing, select your current replacements and drag them to Finder as a backup.");
}

function runList() {
  const prefix = getOption("prefix", DEFAULT_CLI_PREFIX);
  console.log(formatText(buildGenericStarterEntries(prefix)));
}

function runGenerate() {
  const prefix = getOption("prefix", DEFAULT_CLI_PREFIX);
  const format = getOption("format", "text");
  const entries = buildGenericStarterEntries(prefix);

  if (format === "markdown") {
    console.log(formatMarkdown(entries));
    return;
  }

  if (format === "json") {
    console.log(JSON.stringify(entries, null, 2));
    return;
  }

  console.log(formatText(entries));
}

function runDoctor() {
  console.log(`Platform: ${process.platform}`);
  console.log(`Node: ${process.version}`);

  if (process.platform !== "darwin") {
    console.log("Status: limited");
    console.log("This project is designed for macOS because Apple text replacement lives there.");
    return;
  }

  const openCheck = spawnSync("which", ["open"], { encoding: "utf8" });
  console.log(`open command: ${openCheck.status === 0 ? "available" : "missing"}`);
  console.log("Status: ready");
}

switch (command) {
  case "setup":
    runSetup();
    break;
  case "list":
    runList();
    break;
  case "generate":
    runGenerate();
    break;
  case "doctor":
    runDoctor();
    break;
  default:
    printUsage();
}
