# Лавка чудес

The shelf the coins earned in [Quest](https://cogni-quest.github.io/quest/) are
saved up for. A child of six does addition there, banks gold for every opponent
he beats, and comes here to see what it would buy — toy soldiers, photographed
in the garden, standing in their cases with a price under each.

The interface is in Russian; the code, the comments and the docs are in English.

## State

Two shelves: «Орки», four mountain orcs at fifty coins, and «Викинги», five of
them at forty.

### Coins: Quest's gold, less what was spent here

The shop keeps no balance of its own. It works one out every time it is looked
at:

```
coins = gold banked in Quest − spent
```

Quest writes the gold (`quest:profile` → `gold`, only ever added to); the shop
writes `spent` (`magicshop:ledger` → `spent`). Each reads the other's number and
never writes it, so two tabs open at once cannot lose a coin or mint one. Quest
shows the same `gold − spent` in its corner, so both screens agree.

### Where the count starts

The two were joined up with the child already mid-way, and that day is written
in [`src/shop/state.json`](src/shop/state.json), by hand:

```json
{
  "coins": 17,
  "bought": ["orc-1", "orc-2", "viking-2"]
}
```

`coins` is what he had in hand that day; `bought`, the toys already on his
shelf — paid for in those coins, so they cost nothing on top, and can never be
sold back.

Quest's gold is a lifetime total, most of it long spent, so the tablet catches
what Quest held **the first time the shop opens** and counts only gold earned
after it:

```
spent = Quest's gold on that first open − coins + every purchase made here
```

On the day both screens read 17; every opponent beaten after that adds to it.

**So after deploying, open the shop once before playing Quest.** Until the shop
has opened, Quest shows its whole lifetime gold; and gold earned before that
first open is absorbed into the starting point rather than added on top.

Correcting `coins` or `bought` later is a commit, and keeps everything the
tablet bought. The starting gold itself is never moved; to start the count again,
clear `magicshop:ledger` in that browser.

### What that means in practice

Both sites are served from one origin, `cogni-quest.github.io`, and so share one
`localStorage`. Which means:

- it is **per browser** — his tablet and the family laptop count separately,
  and clearing site data forgets both the gold and the purchases;
- under `npm run dev` the two sit on different ports, which are different
  origins, so the shop sees no gold at all;
- «Новая игра» in Quest wipes the gold but not the shop's ledger, so the
  balance reads nought until he has earned past the starting point again.

A new tab picks up fresh gold straight away; an open one does as soon as Quest
writes, or when it comes back into view.

Every case is one of three things, and the metal says which: **gold**, he has
the coins for it; **cinnabar** with a padlock, and how many coins short he is;
**emerald** with a seal, already his.

### Buying

A gold case buys. One tap arms it, «да» spends and «нет» puts it back — the
button is large and a six-year-old's aim is not, and forty coins take a week to
earn.

A purchase can be put back, but only while the shop has stayed open since it was
made: a case bought in this sitting carries «вернуть», and one tap returns the
coins — what he paid, not what the shelf asks today. Close the page and the day
is settled: a toy bought last week is on his shelf at home by now, and handing
the coins back for it would be handing them back twice. What `state.json`
granted can never be returned at all: the file would assert it again on the
next open and the coins would be free.

Each purchase is saved with its price, so raising a price later does not reach
back and charge again for a toy he already has.

A typo in `state.json` is caught before it is deployed: TypeScript reads the
file, and `src/shop/state.test.ts` checks what it cannot — a negative or
fractional balance, an id listed twice, or an id for a toy that does not exist.

## Running it

Needs **Node.js LTS**:

```powershell
npm install
npm run dev        # development, opens localhost
npm test           # the shelf rules, the ledger, the text pack, the catalogue, the state file
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
src\core\wallet.ts     the ledger: spending against the gold earned in Quest
src\adapters\          localStorage, wrapped so a private window cannot crash it
src\shop\catalog.ts    what is on the shelf, and for how much
src\shop\state.json    where the count starts — the file you edit
src\locale\            the text pack: every word the child sees
src\ui\                React components, one hook and one stylesheet
```

`src/core` knows nothing of the outside world — no browser, no React, no
catalogue. That is what lets the rules about reaching a price, and about whose
count wins, be a handful of tests that run in a second. CogniQuest enforces the
same boundary with a `tsconfig.core.json` and an import-graph test; that was
judged not worth it here while `core` held one module. It holds two now, and
`wallet.ts` is the one where a stray `localStorage` import would do real damage,
so the day to add that machinery has arguably arrived.

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
