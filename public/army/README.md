# Армия — the photographs

What the site actually serves. Every file here was produced by `npm run photos`
from an original in `photos/army/`, which is not in git.

**The name is the item's id.** The row `['orc-5', 'army', …]` in
`src/shop/catalog.ts` looks for `orc-5.webp`, and nothing joins the two but the
name — so a typo here is a card with a padlock-grey placeholder on it. A test
(`src/shop/catalog.test.ts`) fails when a row has no picture, which is how that
mistake gets caught before it is deployed rather than after.

The Russian name on the card is **not** here and not in the file name: it comes
from `src/locale/ru.ts`, keyed by the toy's kind. Four orcs share one line there.

## Adding a toy

1. Put the photograph in `photos/army/` and name it after the id you intend to
   use — `orc-5.jpg`.
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
