# Shortcut Pack Style Guide

## Brand Direction

Shortcut Pack uses an Editorial Minimal system with Quiet Utility behavior.

In practice that means:

- serif-led headlines
- calm controls
- warm light surfaces
- short copy
- privacy and trust stated plainly

The product should feel:

- thoughtful
- fast
- useful
- premium
- privacy-respecting

The product should not feel:

- loud
- over-styled
- startup-hype-heavy
- playful for its own sake
- dense with unnecessary explanation

## Core Rules

1. Fewer words, better words.
2. Titles should usually be 1 to 4 words.
3. One idea per section.
4. Examples should explain the product, not decorate it.
5. Trust should sound plain, not defensive.
6. The builder should feel like the same product as the landing page, not a separate app.

## Design Tokens

### Type

- Headline serif:
  `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif`
- Body sans:
  `"Avenir Next", "Segoe UI", sans-serif`
- Monospace:
  `"SF Mono", "Menlo", "Consolas", monospace`

### Color

- Background: `#f5f1e8`
- Paper: `#fbf8f1`
- Ink: `#181612`
- Ink soft: `#5b554c`
- Accent: `#9c5c21`
- Border: `rgba(24, 22, 18, 0.14)`
- Soft border: `rgba(24, 22, 18, 0.08)`
- Accent wash: `rgba(156, 92, 33, 0.1)`
- Panel: `rgba(255, 255, 255, 0.52)`
- Shadow: `0 24px 60px rgba(47, 34, 17, 0.08)`

### Shape And Spacing

- Primary radius: `28px`
- Card radius: `22px`
- Pill radius: `999px`
- Control height: `44px` to `46px`
- Section padding should feel generous, but not airy to the point of waste

## Type Hierarchy

### Headlines

Use serif for:

- hero headlines
- section titles
- card titles when the card is meant to feel editorial

Headline behavior:

- large
- high contrast
- tight tracking
- short copy
- never stuffed with clauses

Examples:

- Type less.
- Native speed.
- Make it yours.
- Free. Private.
- Start simple.

### Body

Use sans for:

- paragraphs
- nav
- form labels
- buttons
- helper text

Body behavior:

- concrete
- quiet
- readable
- short

### Monospace

Use mono only for literal shortcuts and exported file names.

Examples:

- `>home`
- `>pp`
- `>intro`
- `Text Substitutions.plist`

Do not use mono for general UI copy.

## Shared Components

### Header

Both the site and builder should share the same header logic:

- left: wordmark
- middle: navigation when needed
- right: one quiet utility link and one primary action

Current pattern:

- quiet link: `GitHub`
- primary action on site: `Open builder`
- primary action in builder: `Back to site`

Header behavior:

- sticky
- lightly blurred
- compact
- never crowded

### Buttons

Primary button:

- dark fill
- light text
- compact
- calm, not flashy

Secondary button:

- subtle border
- light translucent fill
- same overall height as primary

Quiet utility link:

- no heavy chrome
- muted by default
- darkens on hover

### Pills And Eyebrows

Use for short labels only.

They should feel:

- informative
- light
- quiet

Good examples:

- `Apple text shortcuts`
- `Totally free`
- `No signup`

### Cards And Panels

All cards should use the same family:

- warm translucent fill
- subtle border
- soft shadow
- rounded corners

Use cards when they improve scanning.
Do not add cards just to break up whitespace.

### Example Panels

Example panels should do real explanatory work.

They should:

- show real triggers
- use short descriptions
- be instantly scannable

Good examples:

- `>home` — Your home address in a few characters.
- `>pp` — Passport or ID details without having to remember them.
- `>intro` — A ready-to-send reply on your Mac and iPhone.

## Copy System

### Headlines

Prefer:

- Type less.
- Use cases.
- Native speed.
- Make it yours.
- Short answers.

Avoid:

- long explanatory titles
- stacked benefit claims
- slogans that explain too much at once

### Body Copy

Body copy should:

- explain one thing
- use examples early
- stop as soon as the point lands

Preferred structure:

- one clear sentence
- optional second sentence only if it changes the decision

### Use Cases

Use this structure:

- trigger
- short title
- one sentence for what it is
- one sentence for when it helps

Example:

- `>home`
  Your full home address without retyping it.
  Good for forms, shipping, invoices, and travel.

### Trust And Privacy

Trust copy should stay plain:

- Totally free.
- Community project.
- No signup.
- No saved personal data.
- Your details stay in your browser.

Avoid:

- exaggerated privacy rhetoric
- legal-sounding copy
- defensive over-explaining

### Download Language

Use simple, concrete download labels.

Prefer:

- `Download builder file`
- `Download the plist`

Avoid:

- vague labels
- words that make the flow sound more complicated than it is

## Landing Page Guidance

The landing page should:

- make the value obvious in the first screen
- use a two-column hero on desktop
- keep proof and examples close to the hero
- keep section count low

The landing page should not:

- repeat the same idea in too many sections
- introduce extra visual motifs
- over-explain the product before examples appear

## Builder Guidance

The builder should feel denser than the landing page, but still part of the same system.

Keep:

- the same color tokens
- the same type pairing
- the same header behavior
- the same button language
- the same card treatment

Adjust:

- tighter spacing where workflow density matters
- shorter helper copy
- stronger utility cues

The builder should prioritize:

- clarity
- trust
- momentum

## Reuse Checklist

When adding a new screen or component, check:

1. Is the title short enough?
2. Does the copy stop early enough?
3. Does the component match the shared card and button system?
4. Is the accent used sparingly?
5. Does this feel like Shortcut Pack, not a generic SaaS page?
