# Лавка чудес

The shop where the coins earned in [CogniQuest](https://github.com/dr-o-ne/cogniquest)
get spent. A child of six does addition there, banks gold for every opponent he
beats, and comes here to trade it for the toys sitting on the shelf in the real
world — orc soldiers, photographed in the garden.

The interface is in Russian; the code, the comments and the docs are in English.

## State

One shelf, «Армия», with four orcs at fifty coins each. The balance is typed in
by hand — see **The two apps** below for why — and a purchase debits it and
stamps the card. Everything is kept in the browser.

## Running it

Needs **Node.js LTS**:

```powershell
npm install
npm run dev        # development, opens localhost
npm test           # the wallet, the text pack, and the catalogue
npm run typecheck  # types
npm run build      # typecheck, then build
npm run photos     # photos/ → public/, see below
```

## Deployment

Every push to `main` builds and publishes to GitHub Pages —
**https://cogni-quest.github.io/magic-shop/** — through
`.github/workflows/deploy.yml`.

The site is served from `/magic-shop/`, not from a domain root, so anything
resolved by path at runtime goes through `publicUrl()` in `src/assets.ts`. An
absolute `/army/orc-1.webp` would escape to the domain root, which is to say to
nothing.

To check that locally before pushing:

```powershell
$env:BASE_PATH = '/magic-shop/'; npm run build; Remove-Item Env:\BASE_PATH
npx vite preview --base /magic-shop/
```

(In Git Bash the same line silently becomes `D:/Program Files/Git/magic-shop/` —
MSYS rewrites anything that looks like a Unix path. Use PowerShell for this one.)

## Layout

```
photos\<category>\     the originals off the phone — NOT in git
public\<category>\     the web-sized .webp the site serves
scripts\photos.mjs     one into the other
src\core\              the wallet: pure TypeScript, no DOM, no storage
src\adapters\          localStorage
src\shop\              the catalogue — what is on the shelf, and for how much
src\locale\            the text pack: every word the child sees
src\ui\                React components and one stylesheet
```

`src/core` knows nothing of the outside world — no browser, no React, no saves.
That is what lets every rule about affording, buying, double-buying and refunding
be a test that runs in a second. CogniQuest enforces the same boundary with a
`tsconfig.core.json` and an import-graph test; with one module on this side of
the line, that machinery would cost more than it caught. Worth adding the day
there is a second.

## Adding a toy

A photograph, a command and one row:

1. `photos/army/orc-5.jpg` — named after the id it will have
2. `npm run photos`
3. in `src/shop/catalog.ts`, one line in `ITEMS_TABLE`

The name on the card comes from the toy's **kind**, so four photographs of one
orc soldier share a single line in `src/locale/ru.ts` — which is why a fifth orc
needs no edit there at all. A new **category** is a line in `CATEGORIES_TABLE`, a
label in `t.categories`, and a folder; the tab bar is drawn from the table, so
the tab appears by itself.

## Language

All text addressed to the child lives in `src/locale/ru.ts`. **Nothing outside it
is written in Russian:** code, comments, tests and developer-facing messages are
English. The one exception is the `<title>` in `index.html`, which the browser
needs before any JavaScript runs.

Coin counts go through `t.coins()`, because «1 монета, 2 монеты, 5 монет» is
grammar and grammar is language.

## The two apps

CogniQuest is published at `https://dr-o-ne.github.io/cogniquest/` and this shop
at `https://cogni-quest.github.io/magic-shop/`. `localStorage` is partitioned by
**origin** — scheme, host and port, never the path — so those are two different
hosts and two stores that cannot see one another. There is no automatic sync to
be had, which is why the balance is typed in.

Two things keep the cheap version of a real sync open. The keys are namespaced
(`magicshop:wallet`, against CogniQuest's `cogniquest:profile`), and `setCoins`
is the only way coins ever enter the wallet — so if CogniQuest is one day served
from the same account, reading its `gold` and offering «взять монеты из
CogniQuest» is one more caller of a function that already exists.

## Stack

TypeScript · Vite · React · Vitest · sharp (the photo pipeline, build-time only)
