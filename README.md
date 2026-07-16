# Préime — website preview

Live preview: **https://mysteriousvi.github.io/preime-site/**

A plain HTML/CSS/JS build of the Préime site — no framework, no build step.
Every push updates the live preview within about a minute.

## Layout

| Path | What it is |
|---|---|
| `index.html`, `about.html`, `dermafacial.html`, … | 57 pages, one file per page |
| `assets/` | images and documents |
| `css/styles.css` | the site stylesheet |
| `css/static.css` | page-transition + cookie-bar rules |
| `js/app.js` | all interactivity (~16 KB, no dependencies) |

Filenames are flat, so every link is same-level and nothing depends on server
rewrites — e.g. a product page is `dermaceuticals-pure.html`, a blog post is
`blogs-at-home-routine.html`.

## Heads-up

This repo is a **preview mirror**, not the deployment artifact:

- `robots.txt` here blocks crawlers on purpose, so the preview can't be indexed
  alongside the real domain. The production build ships a permissive one — don't
  copy this repo's `robots.txt` to the live server.
- Every page carries a `noindex` meta tag for the same reason.

To deploy for real, use the generated `preime-html.zip`, not a clone of this repo.

## Regenerating

These files are generated from the React app (the source of truth):

```bash
node tools/build-html.js      # rebuild preime-html/
node tools/publish-html.js    # rebuild + push here
```

Hand edits made in this repo will be overwritten on the next publish.
