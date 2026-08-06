import { VerseEditorSuggester } from './VerseEditorSuggester'
import { DEFAULT_SETTINGS } from '../data/constants'

const newPlugin = () => ({
  app: {},
  settings: { ...DEFAULT_SETTINGS },
  saveSettings: () => {},
})

const newSuggester = (plugin = newPlugin()) =>
  new VerseEditorSuggester(plugin as never, DEFAULT_SETTINGS)

const triggerOn = (line: string, cursorCh: number = line.length) =>
  newSuggester().onTrigger(
    { line: 0, ch: cursorCh },
    { getLine: () => line } as never,
    null as never
  )

const acceptSuggestionOn = (line: string): string | null => {
  const suggester = newSuggester()
  const info = suggester.onTrigger(
    { line: 0, ch: line.length },
    { getLine: () => line } as never,
    null as never
  )
  if (!info) {
    return null
  }
  let result = line
  suggester.context = {
    ...info,
    editor: {
      replaceRange: (
        text: string,
        start: { ch: number },
        end: { ch: number }
      ) => {
        result = line.slice(0, start.ch) + text + line.slice(end.ch)
      },
    },
  } as never
  suggester.selectSuggestion({ allFormattedContent: '<verse>' } as never)
  return result
}

describe('VerseEditorSuggester accepting a suggestion', () => {
  // The trigger prefix is matched against the first two characters of the line,
  // so it is always at column 0 and the whole line up to the cursor belongs to
  // the suggestion. Anything left in front of the inserted verse is a bug - a
  // stray "-" was what this originally produced.
  test.each([
    '--Genesis 1:1',
    '-- Genesis 1:1',
    '++Genesis 1:1',
    '--1 Cor. 13:4',
    '--Song of Solomon 1:1',
    '--John 3:16-18',
    '--1John1:1',
  ])('replaces the trigger and the whole reference in %s', (line) => {
    expect(acceptSuggestionOn(line)).toBe('<verse>')
  })
})

describe('VerseEditorSuggester.onTrigger', () => {
  test('does not consume text typed after the reference', () => {
    expect(triggerOn('--Genesis 1:1 and then some notes')).toBeNull()
  })

  test('reads only up to the cursor, not the rest of the line', () => {
    const info = triggerOn('--Genesis 1:1 and then some notes', 13)
    expect(info).not.toBeNull()
    expect(info?.end).toEqual({ line: 0, ch: 13 })
  })

  test.each([
    'Genesis 1:1', // no trigger prefix
    '--John 3:16-', // half-typed range
    '--John 3', // bare chapter
    '--', // prefix alone
    // Prose in front of the reference. The pattern spans whitespace so
    // multi-word book names survive, which made "am reading Genesis" a
    // candidate book name, and it is unanchored, so punctuation in front was
    // simply skipped over.
    '--i am reading Genesis 1:1',
    '--see Eph. 2:8',
    '--note: Genesis 1:1',
    '--today, Genesis 1:1',
    '--todo item 3: 1 thing',
    '--Notabook 1:1',
    // Typo, not a book. Used to match as "1 John" and fetch the Gospel of John.
    '--11 John 1:1',
    '--123 John 1:1',
  ])('does not trigger on %s', (line) => {
    expect(triggerOn(line)).toBeNull()
  })
})

describe('VerseEditorSuggester inline version', () => {
  const triggerWithPlugin = (line: string) => {
    const plugin = newPlugin()
    const info = newSuggester(plugin).onTrigger(
      { line: 0, ch: line.length },
      { getLine: () => line } as never,
      null as never
    )
    return { info, plugin }
  }

  // "@" names the version, and the key is written in either case.
  test.each([
    ['--John 3:16@esv', 'John 3:16@esv', 'esv'],
    ['--John 3:16@ESV', 'John 3:16@esv', 'esv'],
    ['--john3:16-17@kjv', 'john3:16-17@kjv', 'kjv'],
    ['--john3:16-17@KJV', 'john3:16-17@kjv', 'kjv'],
    // A version key with a dash of its own must survive whole.
    ['--John 3:16@oeb-cw', 'John 3:16@oeb-cw', 'oeb-cw'],
  ])('%s picks the version', (line, query, version) => {
    const { info, plugin } = triggerWithPlugin(line)
    expect(info?.query).toBe(query)
    expect(plugin.settings.bibleVersion).toBe(version)
  })

  // The dash stays the range separator, it never names a version.
  test.each(['--John 3:16-18', '--Hebrews 9:1-10:14', '--John 3:a'])(
    '%s leaves the version alone',
    (line) => {
      const { info, plugin } = triggerWithPlugin(line)
      expect(info).not.toBeNull()
      expect(plugin.settings.bibleVersion).toBe(DEFAULT_SETTINGS.bibleVersion)
    }
  )

  test('the dash form is not a version suffix', () => {
    expect(triggerOn('--John 3:16-esv')).toBeNull()
  })
})
