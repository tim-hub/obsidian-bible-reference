/*
 * One-time dev generator for the bundled offline Bible.
 *
 * Pulls the public-domain World English Bible (WEB) from TehShrike's
 * public-domain dataset and emits a compact index-based JSON:
 *   string[][][]  ->  bible[bookId-1][chapter-1][verse-1] = text
 * in canonical 66-book Protestant order (aligned to getTranslationBooks('en')).
 *
 * Run once, commit the output:
 *   bun packages/obsidian-bible-reference/scripts/build-offline-bible.mjs
 *
 * Source: https://github.com/TehShrike/world-english-bible (public domain)
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const outFile = path.resolve(scriptsDir, '../src/data/offlineBible.web.json')

const RAW = 'https://raw.githubusercontent.com/TehShrike/world-english-bible/master/json'

// TehShrike filenames in canonical 1-66 order (matches getTranslationBooks('en')).
const BOOK_FILES = [
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'ruth', '1samuel', '2samuel',
  '1kings', '2kings', '1chronicles', '2chronicles', 'ezra',
  'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
  'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations',
  'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
  'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
  'zephaniah', 'haggai', 'zechariah', 'malachi', 'matthew',
  'mark', 'luke', 'john', 'acts', 'romans',
  '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians',
  'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy',
  'titus', 'philemon', 'hebrews', 'james', '1peter',
  '2peter', '1john', '2john', '3john', 'jude',
  'revelation',
]

// Only these segment types carry actual verse text; footnotes/markers do not.
const TEXT_TYPES = new Set(['paragraph text', 'line text'])

const normalize = (s) => s.replace(/\s+/g, ' ').trim()

/** Flatten TehShrike's flat segment array into book[chapter-1][verse-1] = text. */
function flattenBook(segments) {
  // chapter -> verse -> accumulated text
  const chapters = new Map()
  for (const seg of segments) {
    if (!TEXT_TYPES.has(seg.type)) continue
    if (typeof seg.value !== 'string') continue
    const { chapterNumber: c, verseNumber: v } = seg
    if (!c || !v) continue
    if (!chapters.has(c)) chapters.set(c, new Map())
    const verses = chapters.get(c)
    verses.set(v, (verses.get(v) ?? '') + seg.value)
  }
  const maxChapter = Math.max(...chapters.keys())
  const out = []
  for (let c = 1; c <= maxChapter; c++) {
    const verses = chapters.get(c) ?? new Map()
    const maxVerse = verses.size ? Math.max(...verses.keys()) : 0
    const chapterArr = []
    for (let v = 1; v <= maxVerse; v++) {
      chapterArr.push(normalize(verses.get(v) ?? ''))
    }
    out.push(chapterArr)
  }
  return out
}

async function main() {
  const bible = []
  for (let i = 0; i < BOOK_FILES.length; i++) {
    const file = BOOK_FILES[i]
    process.stdout.write(`[${i + 1}/66] ${file} ... `)
    const res = await fetch(`${RAW}/${file}.json`)
    if (!res.ok) throw new Error(`fetch ${file} failed: ${res.status}`)
    const segments = await res.json()
    const book = flattenBook(segments)
    bible.push(book)
    console.log(`${book.length} chapters`)
  }

  // Validation
  if (bible.length !== 66) throw new Error(`expected 66 books, got ${bible.length}`)
  const john316 = bible[42]?.[2]?.[15] // John(43) 3:16 -> [42][2][15]
  console.log('\nJohn 3:16 =>', JSON.stringify(john316))
  if (!john316 || !/God so loved the world/.test(john316)) {
    throw new Error('John 3:16 spot-check failed')
  }

  await fs.writeFile(outFile, JSON.stringify(bible), 'utf8')
  const { size } = await fs.stat(outFile)
  console.log(`\nWrote ${outFile} (${(size / 1024 / 1024).toFixed(2)} MB)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
