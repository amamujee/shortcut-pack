# Text Shortcut Kit

Text Shortcut Kit is a small local-first tool for creating Apple text replacements without hand-entering dozens of snippets one by one.

You download a single HTML file, open it on your Mac, fill in the details you repeat all the time, and export a `Text Substitutions.plist` file that macOS can import.

## What it does

- Starts you with a useful shortcut pack for identity, work, writing, and personal snippets
- Lets you rename shortcut triggers before export
- Lets you edit every generated phrase
- Lets you add fully custom shortcuts
- Skips blank profile-driven entries instead of exporting placeholder text
- Exports a plist that macOS supports importing directly
- Runs entirely in the browser with no signup, no backend, and no data leaving your machine

## Quick start

1. Download [`index.html`](./index.html).
2. Double-click it, or open it in any browser on your Mac.
3. Fill in the profile fields you want to reuse.
4. Review the starter shortcuts and add any custom ones you want.
5. Click `Download plist`.
6. Open `System Settings` -> `Keyboard` -> `Text Replacements`.
7. Drag the downloaded `Text Substitutions.plist` into the Text Replacements list.

If you are viewing this on GitHub, open [`index.html`](./index.html) and use GitHub's raw-file download option, or grab the standalone HTML file from a release or blog post link.

## Why people use this

Apple's built-in text replacement is great once it is set up, but the setup is tedious:

- you have to invent consistent shortcut names
- you have to add each row manually
- you usually remember the idea after you are already busy

This tool removes the blank-page problem and gets you to a usable starter pack quickly.

## What you can customize

- Prefix: choose something that is memorable but hard to trigger accidentally
- Starter shortcuts: turn rows on or off, rename suffixes, and edit the expanded text
- Custom shortcuts: add anything unique to your own life or workflow
- Export preview: catch duplicates before you download the plist

## Editing the default list and categories

If you want to change the built-in shortcuts before publishing your own version, edit [`starter-pack.cjs`](./starter-pack.cjs).

That file is the main source of truth for:

- categories
- default suffixes
- descriptions
- placeholder text
- generated text logic

Each starter entry looks like a small definition object with an `id`, `category`, `title`, `suffix`, and `build(profile)` function.

After editing the starter pack or UI source files, rebuild the standalone HTML file:

```bash
node build-standalone.mjs
```

## Project structure

- [`index.html`](./index.html): standalone file for end users
- [`index.source.html`](./index.source.html): source HTML template
- [`styles.css`](./styles.css): app styling
- [`app.js`](./app.js): browser logic and plist export
- [`starter-pack.cjs`](./starter-pack.cjs): default categories and shortcuts
- [`build-standalone.mjs`](./build-standalone.mjs): inlines the app into one HTML file
- [`cli.mjs`](./cli.mjs): optional Node CLI

## Optional CLI

Most people can ignore the CLI. The main experience is the standalone HTML file.

If you want the Node helper commands:

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

## Why the app exports a plist

This project takes the safer route: it generates the import format that macOS already accepts instead of writing into hidden internal text replacement stores that may change across macOS versions.

That makes it much easier to share publicly and much less fragile over time.

## Publishing notes

If you are sharing this with non-technical users, the easiest distribution options are:

- link directly to the standalone [`index.html`](./index.html) file
- attach the standalone HTML file to a GitHub release
- include screenshots and a short import walkthrough in your blog post

Screenshots are not checked into the repo yet, so the current README stays lightweight and download-first.

## License

[MIT](./LICENSE)
