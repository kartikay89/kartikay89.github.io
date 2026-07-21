# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## What this is

A static personal portfolio/blog site for Kartikay Singh, served via GitHub Pages
at `kartikay89.github.io`. No framework, no build step, no package manager —
plain HTML, one shared stylesheet, and one shared vanilla-JS file.

## Repository structure

```
index.html    Home page — hero, about, skills, projects (with client-side filter), blog preview, contact
blog.html     Full blog post listing (post links currently point to "#", i.e. placeholders)
notes.html    "Second brain" notes grid, grouped by category (Data Engineering, Game Dev, Software, AI & LLMs)
style.css     Single global stylesheet for all three pages
script.js     Single global script for all three pages (three independent IIFEs)
README.md     One-line repo description
```

There is no `src/`, no bundler config, no `package.json`, and no CI workflow.
Pages are opened/served directly — GitHub Pages serves the repo root as-is.

## Development workflow

- **Run locally**: open the HTML files directly in a browser, or serve the
  directory with any static file server (e.g. `python3 -m http.server`) since
  there's no build/compile step.
- **Deploy**: pushing to the default branch (`master`) is what GitHub Pages
  publishes — there is no separate build/deploy pipeline or GitHub Action.
- **No tests, linters, or type checking** are configured. Verify changes by
  visually checking the affected page(s) in a browser.

## Conventions

- **CSS**
  - Design tokens (colors, etc.) are defined once as custom properties in
    `:root` at the top of `style.css` — reuse `var(--token)` rather than
    hardcoding colors/values.
  - Class naming follows a BEM-like `block__element--modifier` pattern, e.g.
    `.hero__title`, `.nav__link.active`, `.btn--primary`. Follow this pattern
    for any new components.
  - The stylesheet is organized into clearly delimited sections with
    `/* ── Section Name ──... */` banner comments (Tokens, Reset, Layout
    helpers, Navigation, Buttons, Hero, About, Projects, etc.). Add new rules
    under the relevant existing section, or add a new banner-delimited section
    at the appropriate place, rather than appending unrelated rules to the
    end of the file.
- **JavaScript**
  - `script.js` is loaded on every page and is organized as independent,
    self-contained IIFEs, each scoped to one behavior (nav shadow-on-scroll,
    project filter, active-nav-on-scroll). Each IIFE guards itself with an
    early `return` when its target elements aren't present on the current
    page, so the same file works safely across all pages. Follow this pattern
    for new behaviors instead of adding global functions/variables.
  - No build step means no ES modules/imports and no transpilation — stick to
    plain, browser-native JS (the code currently targets evergreen browsers,
    e.g. arrow functions, `const`/`let`, template-free string concatenation
    is not required).
- **HTML**
  - All three pages share the same `<nav>` and `<footer>` markup structure
    (copy-pasted, not templated) — if you change the nav or footer, update it
    identically in `index.html`, `blog.html`, and `notes.html`.
  - Section markup uses a recurring `section-label` (small caps label + line)
    pattern before each section heading — follow it for new sections.
  - Google Fonts (`Inter`) is loaded via `<link>` tags in each page's `<head>`;
    keep these in sync if the font changes.

## Content notes

- Blog posts on `blog.html` and the blog preview on `index.html` are currently
  static placeholder content (links point to `#`, not real post pages). There
  is no CMS or markdown pipeline — adding a real post means adding new HTML.
- The "Notes" page (`notes.html`) is similarly static placeholder content per
  note card.
- Contact email in `index.html` is `kartikays89@gmail.com`; keep contact info
  consistent if it changes.
