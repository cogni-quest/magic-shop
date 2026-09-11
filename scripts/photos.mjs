/**
 * Turns the photographs as they came off the phone into what the site serves.
 *
 *   photos/<category>/<id>.jpg   →   public/<category>/<id>.webp
 *
 * Run it after dropping in a new toy: `npm run photos`. Existing files are left
 * alone unless the original is newer, so it is cheap to run over and over; pass
 * `--force` to redo everything after changing the settings below.
 *
 * This exists rather than a note saying «resize them first» because toys keep
 * arriving. Done by hand, the size and the quality drift from one batch to the
 * next, and drift is visible in a grid: one card sharper than its neighbours,
 * one file six times larger than the rest.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = join(root, 'photos')
const target = join(root, 'public')

/**
 * The longest side, in pixels.
 *
 * A card shows at most 16rem ≈ 256 CSS px, which a tablet at 2× wants 512 of.
 * The full-screen view is what pushes this higher: it runs to about 92vw, some
 * 700 px on a tablet. One thousand covers that with room to spare, and one file
 * per toy beats a srcset with two — this pipeline is run by hand, and every
 * extra file is another thing to forget.
 */
const LONGEST_SIDE = 1000

/** 80 lands these photographs at 60–120 KB, which is where the eye stops caring. */
const QUALITY = 80

/** Loud enough to notice, above which something has gone wrong. */
const WARN_ABOVE = 250 * 1024

const READABLE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])

const force = process.argv.includes('--force')

const categories = (await readdir(source, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

if (categories.length === 0) {
  console.log(`Nothing in ${source}. Put the originals in photos/<category>/ and run again.`)
  process.exit(0)
}

let written = 0
let skipped = 0

for (const category of categories) {
  const from = join(source, category)
  const into = join(target, category)
  await mkdir(into, { recursive: true })

  for (const file of await readdir(from)) {
    const extension = extname(file).toLowerCase()

    // iPhones save HEIC by default and sharp's prebuilt binaries cannot read
    // it. Worth naming, because the alternative is a stack trace about libheif.
    if (extension === '.heic' || extension === '.heif') {
      console.warn(
        `  ${file} — HEIC cannot be read. On the phone: Settings → Camera → Formats → Most Compatible, or export as JPEG.`,
      )
      continue
    }

    if (!READABLE.has(extension)) continue

    const input = join(from, file)
    const output = join(into, `${basename(file, extname(file))}.webp`)

    if (!force && existsSync(output)) {
      const [was, is] = await Promise.all([stat(input), stat(output)])
      if (is.mtimeMs >= was.mtimeMs) {
        skipped += 1
        continue
      }
    }

    const image = sharp(input)
      // First, and with no argument: this applies the EXIF orientation tag and
      // then drops it. Without it every portrait photograph off a phone arrives
      // on its side, because the resize discards the tag the browser was relying
      // on. The single most important line in this file.
      .rotate()
      .resize({
        width: LONGEST_SIDE,
        height: LONGEST_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY })

    const { data, info } = await image.toBuffer({ resolveWithObject: true })
    await writeFile(output, data)
    written += 1

    const before = (await stat(input)).size
    const note = data.length > WARN_ABOVE ? '  ← larger than expected' : ''
    console.log(
      `  ${category}/${file}  ${kb(before)} → ${kb(data.length)}  (${info.width}×${info.height})${note}`,
    )
  }
}

console.log(`\n${written} written, ${skipped} already up to date.`)

function kb(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}
