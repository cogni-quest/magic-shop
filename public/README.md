# The photographs

What the site actually serves. Every file here was produced by `npm run photos`
from an original in `photos/`, which is not in git.

**One folder per category, named after it.** `public/orcs/` and
`public/vikings/` today, because the catalogue builds the path from the
category's id: the row `['viking-6', 'vikings', …]` looks for
`public/vikings/viking-6.webp` and nowhere else. Add a category and it brings a
folder with it; rename one and the photographs have to move.

**The file name is the item's id.** Nothing joins a row to its picture but that
name, so a typo here is a card with a padlock-grey placeholder on it. A test
(`src/shop/catalog.test.ts`) fails when a row has no picture, which is how that
mistake gets caught before it is deployed rather than after.

Note that the id keeps its own prefix — `orc-1`, `viking-1` — even though the
folder now says the same thing. An id is a save key: a toy the child already has
is remembered by it, and renaming one would quietly un-buy that toy.

The Russian name on the card is **not** here and not in the file name: it comes
from `src/locale/ru.ts`, keyed by the toy's kind — one line per kind, which
today is one line per figure.

## Adding a toy

1. Put the photograph in `photos/<category>/` and name it after the id you
   intend to use — `photos/vikings/viking-6.jpg`.
2. `npm run photos`
3. Add the row to `ITEMS_TABLE` in `src/shop/catalog.ts`, with a focus point and
   a zoom for the new picture (the two numbers that decide how the card crops
   into it — see the comments on `Item`).
4. `npm test`

## Shooting them

Nothing is required, and the crop settings exist precisely because these were
snapshots rather than product shots. Two things still help: hold the camera
level with the toy rather than above it, and leave the figure a little room in
the frame — the card can zoom in, but it cannot zoom out.
