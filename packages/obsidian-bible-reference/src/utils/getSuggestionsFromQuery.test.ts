import { getSuggestionsFromQuery } from './getSuggestionsFromQuery'
import { DEFAULT_SETTINGS } from '../data/constants'

describe('getSuggestionsFromQuery with a book that does not exist', () => {
  test.each([
    'Notabook 1:1',
    'todo item 3: 1 thing',
    'see 1 Cor. 13:4', // prose in front of a numbered book: resolves to "see"
  ])('resolves to no suggestions for %s', async (query) => {
    expect(await getSuggestionsFromQuery(query, DEFAULT_SETTINGS)).toEqual([])
  })
})
