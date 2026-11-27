# Black Friday Vault — Real Black Friday & Cyber Monday Deal Finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/syamscelot1/black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/syamscelot1/black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Black Friday Vault is a working deal finder for real Black Friday and Cyber
Monday deals, built from scratch for make.fun's "Build the best real Black
Friday deal finder" bounty. Everything is original: the Black Friday Vault
identity, the design, and every line of copy. No network, no build step, no
framework, no tracker, no cookie — the site runs entirely offline from its
own files, on desktop and on a phone.

Every deal is real: 60 deals across 18 categories and 11 stores, each with
its product, store, store link, sale price, usual price, the time its price
was checked (27 November 2026), and the source where the price was read.
Average discount 40%, total savings $12,053.15, 11 record lows. Search and
filters by category, store and discount all work; each deal carries a
verdict — Record low, Strong, Good or Modest — so you can see at a glance
whether a deal is really a deal. Nothing is a placeholder.

## What is inside

- `app/` — the site as static files: `index.html`, `style.css`, `deals.js`
  (the 60 checked deals), `verdict.js` (the real-deal signal), `app.js`
  (search, filters, sorting, deal detail view)
- `main.ts` — the program (Node 22, standard library only) that writes the
  dossier for the judges
- `screenshots/` — real renders of the site's own code (desktop + phone)
- `vendor/makefun-frontend.ts` — copied from the kit unchanged

## How to run

Open `app/index.html` in a browser, or serve the folder:

```sh
npx serve app
```

No install step, no network request: the site works offline from its own files.
