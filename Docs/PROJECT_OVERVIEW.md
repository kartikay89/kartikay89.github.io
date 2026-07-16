# Project Overview — kartikay89.github.io

Parent index for all documentation in this repo. Read this first; it links out to everything else.

## What this is

A static personal portfolio site for Kartikay Singh (Data Engineer / Game Developer / Builder), hosted on GitHub Pages. No build step, no framework — plain HTML, CSS, and vanilla JS.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home — hero, About, Skills, Projects (with client-side category filter), Blog preview, Contact |
| `blog.html` | Full blog post list (titles/excerpts only — no per-post pages exist yet) |
| `notes.html` | "Second brain" notes grid, grouped by topic color |
| `style.css` | All styling for every page (single shared stylesheet, CSS custom-properties theme) |
| `script.js` | All behavior for every page (nav scroll shadow, project filter, scroll-spy nav) |

## Docs in this folder

- [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) — this file
- [`user-stories.md`](user-stories.md) — task tracker: what's shipped vs. still a placeholder

## Folder-level memory

- [`../memory.md`](../memory.md) — inventory of every file at repo root, what it contains, and known placeholders/gaps

## Conventions going forward

- Update [`../memory.md`](../memory.md) whenever a file's content or structure changes.
- Log new work as a story in [`user-stories.md`](user-stories.md) before starting it, then check it off.
- This is a flat, single-folder static site — one `memory.md` at root covers everything. If the site grows subfolders (e.g. a `posts/` directory for real blog pages), each new folder should get its own `memory.md`, linked from here.
