# Shortcut Pack

Shortcut Pack is a local-first builder for Apple text replacements.

It helps you turn the details you reuse all the time, like your email, address, links, IDs, bios, and replies, into a clean shortcut pack you can import into macOS in a few minutes.

Live site: [shortcutpack.com](https://shortcutpack.com)

## What It Does

- Starts with a sensible set of shortcut defaults for identity, links, addresses, and replies
- Lets you choose a shared trigger prefix like `>` or `@@`
- Shows live shortcut previews as you fill in your details
- Lets you edit every trigger and every expanded text value before export
- Supports fully custom shortcuts
- Skips blank fields instead of exporting junk placeholders
- Exports a `Text Substitutions.plist` file that macOS already knows how to import
- Runs entirely in the browser with no signup, no backend, and no data leaving your machine

## Quick Start

1. Go to [shortcutpack.com](https://shortcutpack.com) and open the builder, or download the standalone [`generator.html`](./generator.html) file from this repo.
2. Open the builder in any browser on your Mac.
3. Fill in only the details you actually reuse.
4. Review the starter shortcuts, then change any trigger or expanded text you want.
5. Add custom shortcuts for anything the starter list does not already cover.
6. Click `Download Text Substitutions.plist`.
7. On your Mac, open `System Settings` -> `Keyboard` -> `Text Replacements`.
8. Drag the downloaded `Text Substitutions.plist` into the list.

## Why This Exists

Apple's built-in text replacement is genuinely useful once it is set up, but the setup is annoying:

- you have to think up a system for naming shortcuts
- you have to add rows one by one
- you usually remember to do it when you are already in the middle of work

Shortcut Pack removes the blank-page problem and gets you to a useful system quickly.

## Who It Is For

- people who type the same personal details over and over
- founders, operators, recruiters, and assistants who send lots of repetitive replies
- anyone who already likes Apple text replacement but has never taken the time to set it up properly

## What You Can Customize

- Trigger prefix: pick something memorable but hard to trigger accidentally
- Starter shortcuts: turn rows on or off, rename triggers, and rewrite expanded text
- Custom shortcuts: add anything unique to your own workflow
- Export preview: catch duplicate triggers before you download the plist

## Editing The Defaults

If you want to change the built-in shortcut pack before publishing your own version, start with [`starter-pack.cjs`](./starter-pack.cjs).

That file is the main source of truth for:

- categories
- default triggers
- descriptions
- placeholder text
- generated text logic

Each starter entry is a small definition object with an `id`, `category`, `title`, `suffix`, and `build(profile)` function.

## Project Structure

- [`index.source.html`](./index.source.html): source for the landing page
- [`index.html`](./index.html): built landing page used by the public site
- [`generator.source.html`](./generator.source.html): source for the standalone builder
- [`generator.html`](./generator.html): built standalone builder for end users
- [`styles.css`](./styles.css): builder styling
- [`app.js`](./app.js): browser logic, live preview, and plist export
- [`starter-pack.cjs`](./starter-pack.cjs): default shortcut definitions
- [`build-standalone.mjs`](./build-standalone.mjs): builds the standalone HTML files
- [`cli.mjs`](./cli.mjs): optional Node helper commands

## Local Development

Rebuild the standalone files after changing the landing page, builder, styles, or starter pack:

```bash
node build-standalone.mjs
```

Quick checks:

```bash
node --check app.js
node --check build-standalone.mjs
node cli.mjs doctor
```

## Optional CLI

Most people can ignore the CLI. The main experience is the standalone builder HTML file.

If you want the helper commands:

```bash
node cli.mjs setup
node cli.mjs list
node cli.mjs generate
node cli.mjs doctor
```

Examples:

```bash
node cli.mjs list --prefix="@@"
node cli.mjs generate --format=markdown --prefix="@@"
```

## Why Export A plist

This project takes the safer route: it generates the import format that macOS already accepts instead of writing into hidden internal text replacement stores that may change across macOS versions.

That makes it easier to share publicly and much less fragile over time.

## Publishing Notes

If you are sharing this with non-technical users, the easiest distribution options are:

- use [`index.html`](./index.html) as the website homepage
- link directly to the standalone [`generator.html`](./generator.html) file
- attach the standalone builder HTML file to a GitHub release
- include a short import walkthrough in your blog post

## License

[MIT](./LICENSE)
