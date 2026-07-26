import { getSuggestionsFromQuery } from './getSuggestionsFromQuery'
import { DEFAULT_SETTINGS } from '../data/constants'

// splitBibleReference does not reject an unknown book - resolveBookName hands
// the candidate back unchanged - so the throw comes out of localizedBookName
// instead. That call used to sit outside the try, which turned every keystroke
// on a line like "--Notabook 1:1" into an unhandled promise rejection.
describe('getSuggestionsFromQuery with a book that does not exist', () => {
  test.each([
    'Notabook 1:1',
    'todo item 3: 1 thing',
    'see 1 Cor. 13:4', // prose in front of a numbered book: resolves to "see"
  ])('resolves to no suggestions for %s', async (query) => {
    expect(await getSuggestionsFromQuery(query, DEFAULT_SETTINGS)).toEqual([])
  })
})
