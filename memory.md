# memory: repo root (kartikay89.github.io)

Flat static site, no subfolders besides `Docs/`. This file inventories every file here. See [`Docs/PROJECT_OVERVIEW.md`](Docs/PROJECT_OVERVIEW.md) for the doc index and [`Docs/user-stories.md`](Docs/user-stories.md) for open work.

## Files

**`index.html`**
Home page. Sections: nav, hero, About (bio + 3 skill cards: Data Engineering / Game Development / Software), Projects (6 cards across Data/Games/Software, filterable via `data-category` + `.filter-btn`/`data-filter`), Blog preview (3 static post rows, links to `blog.html`), Contact (email/GitHub/LinkedIn cards), footer.

**`blog.html`**
Full blog listing. 5 static `.blog-post-row` entries (date, title, excerpt). All `href="#"` — no post detail pages exist.

**`notes.html`**
"Second brain" notes grid. 10 static `.note-card` entries grouped by category via inline `--note-color` custom property (Data Engineering = blue `#2563EB`, Game Dev = purple `#7c3aed`, Software = green `#059669`, AI & LLMs = amber `#d97706`). All `href="#"` — no note detail pages exist.

**`style.css`**
Single shared stylesheet for all three pages. Theme: "Warm Minimal", tokens defined in `:root` (`--bg #F9F9F8`, `--accent #2563EB`, etc.). Sections in file order: reset, layout helpers, nav, buttons, section label, hero, about, projects, blog preview, contact, footer, page-hero (shared by blog/notes), blog-full list, notes grid, responsive breakpoints (900px, 640px).

**`script.js`**
Three independent IIFEs, each a no-op if its target selector is absent (safe to include on every page):
1. Nav shadow on scroll — toggles `.nav--scrolled` when `scrollY > 8`.
2. Project filter — click a `.filter-btn`, show/hide `.pcard` elements by `data-category` match (index.html only, no-ops elsewhere).
3. Active nav on scroll — scroll-spy that toggles `.nav__link.active` based on section position (index.html only, no-ops elsewhere).

**`README.md`**
One-line repo description ("My Website from ipad").

**`Docs/`**
Documentation folder — see [`Docs/PROJECT_OVERVIEW.md`](Docs/PROJECT_OVERVIEW.md).

## Known gaps (tracked in `Docs/user-stories.md`)

- All blog post and note card links are `href="#"` placeholders.
- LinkedIn contact link is `href="#"` placeholder.

## Update rule

Whenever a file above changes shape (new section, new script behavior, new page), update its entry in this file in the same change.
