# Лавка чудес

The shelf the coins earned in [CogniQuest](https://github.com/dr-o-ne/cogniquest)
are saved up for. A child of six does addition there, banks gold for every
opponent he beats, and comes here to see what it would buy — toy soldiers,
photographed in the garden, standing in their cases with a price under each.

The interface is in Russian; the code, the comments and the docs are in English.

## State

Two shelves: «Орки», four mountain orcs at fifty coins, and «Викинги», five of
them at forty.

**The page never writes anything.** What the child has — how many coins, which
toys are already his — lives in [`src/shop/state.json`](src/shop/state.json) and
is edited by hand:

```json
{
  "coins": 120,
  "bought": ["orc-2"]
}
```

Change it, commit, and the shelf says so once the deploy finishes. Every case is
then one of three things, and the metal says which: **gold**, he has the coins
for it; **cinnabar** with a padlock, and how many coins short he is; **emerald**
with a seal, already his.

There is no buy button, on purpose. A static site has nowhere to write except
the tablet it happens to be open on, and a tablet quietly disagreeing with this
file would be worse than no memory at all. The trade happens at the kitchen
table; the file records what was agreed. (A version that could spend, with a
wallet in `localStorage`, is in the history at `Add the shop` if it is ever
wanted back.)

A typo is caught before it is deployed: TypeScript reads the file, and
`src/shop/state.test.ts` checks what it cannot — a negative or fractional
balance, an id listed twice, or an id for a toy that does not exist.

## Running it

Needs **Node.js LTS**:

```powershell
npm install
npm run dev        # development, opens localhost
npm test           # the shelf rules, the text pack, the catalogue, the state file
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
src\core\shelf.ts      given the state and a toy: his, within reach, or not yet
src\shop\catalog.ts    what is on the shelf, and for how much
src\shop\state.json    what the child has — the file you edit
src\locale\            the text pack: every word the child sees
src\ui\                React components and one stylesheet
```

`src/core` knows nothing of the outside world — no browser, no React, no
catalogue. That is what lets the rules about reaching a price be a handful of
tests that run in a second. CogniQuest enforces the same boundary with a
`tsconfig.core.json` and an import-graph test; with one module on this side of
the line, that machinery would cost more than it caught. Worth adding the day
there is a second.

## The look

A lacquer box with the lid off: black ground, gold hairlines, a second line
inside the first, a vignette in every corner, square corners throughout. Ruslan
Display for the sign, PT Serif for what the child reads, PT Mono for the small
capitals — all three from Google Fonts, all three with a local fallback.

**Dark only**, deliberately: `color-scheme: dark` and no light palette. One
committed look beats two half-tuned ones, and every colour is chosen against the
black. This is where the shop parts company with CogniQuest, which is a warm
off-white workbook and right to be — the shop is the other half of the evening.

Three metals do all the signalling, and nothing else may use them:

| | |
|---|---|
| gold | what a thing costs, and what he can take today |
| cinnabar | what he cannot reach yet |
| emerald | what is already his |

A category's colour (`CATEGORIES_TABLE`) is a fourth voice and has to stay clear
of those three. The orcs keep gold; the vikings took the cold blue, which is
what is left once red, green and yellow are spoken for.

## Adding a toy

A photograph, a command and one row:

1. `photos/vikings/viking-6.jpg` — in the category's folder, named after the id
   it will have
2. `npm run photos`
3. in `src/shop/catalog.ts`, one line in `ITEMS_TABLE`

The name on the card comes from the toy's **kind**, so a second photograph of a
toy already on the shelf reuses its line in `src/locale/ru.ts` and needs no edit
there at all; a toy of a new kind adds one line to `t.items`. The four mountain
orcs are four kinds, one per weapon — palash, axe, cleaver, club — because on
the shelf that is what tells them apart. The five vikings are five more: three
named for what they carry, and two — a jarl, a berserk — for what they are,
which is the word the child uses for them anyway. A new **category** is a line in
`CATEGORIES_TABLE`, a label in `t.categories`, and a folder; the tab bar is drawn
from the table, so the tab appears by itself.

## Language

All text addressed to the child lives in `src/locale/ru.ts`. **Nothing outside it
is written in Russian:** code, comments, tests and developer-facing messages are
English. The one exception is the `<title>` in `index.html`, which the browser
needs before any JavaScript runs.

Coin counts go through `t.coins()`, because «1 монета, 2 монеты, 5 монет» is
grammar and grammar is language.

## Stack

TypeScript · Vite · React · Vitest · sharp (the photo pipeline, build-time only)
