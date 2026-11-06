import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { VerseOfDayEditorSuggester } from './VerseOfDayEditorSuggester'
import { DEFAULT_SETTINGS } from '../data/constants'

const ourMannaResponse = (reference: string) => ({
  verse: {
    details: {
      text: 'verse of the day text',
      reference,
      version: 'NIV',
      version_url: '',
    },
    notice: '',
  },
})

const suggestionsFor = (reference: string) => {
  spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => ourMannaResponse(reference),
  } as Response)
  const suggester = new VerseOfDayEditorSuggester({ app: {} } as never, {
    ...DEFAULT_SETTINGS,
    defaultBibleVersion: 'niv',
  })
  return suggester.getSuggestions({} as never)
}

afterEach(() => mock.restore())

describe('VerseOfDayEditorSuggester', () => {
  it('suggests the verse of the day', async () => {
    const suggestions = await suggestionsFor('John 3:16')
    expect(suggestions).toHaveLength(1)
  })

  it('suggests nothing when the reference names a book no catalog knows', async () => {
    expect(await suggestionsFor('Notabook 1:1')).toEqual([])
  })
})
