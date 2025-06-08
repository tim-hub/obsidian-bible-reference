import { bcv_parser } from 'bible-passage-reference-parser/esm/bcv_parser.js'
import {
  grammar,
  regexps,
  translations,
} from 'bible-passage-reference-parser/esm/lang/en.js'

interface BCVParserConstructor {
  grammar: unknown
  regexps: unknown
  translations: unknown
}

const lang: BCVParserConstructor = {
  grammar,
  regexps,
  translations,
}

const bcv = new bcv_parser(lang)

bcv.set_options({
  book_alone_strategy: 'full',
  book_sequence_strategy: 'include',
})

export const getBookOsis = (bookName: string): string => {
  const parsed = bcv.parse(bookName).osis()
  // The osis output might be something like "Gen.1" if only "Genesis" is passed in.
  // We only want the book part.
  if (parsed.includes('.')) {
    return parsed.split('.')[0]
  }
  return parsed
}

export const getBookFullName = (bookName: string): string => {
  try {
    // Use bcv_parser to parse the book name and get the full name
    const parsed = bcv.parse(bookName)

    if (parsed.entities && parsed.entities.length > 0) {
      const entity = parsed.entities[0]
      if (entity.passages && entity.passages.length > 0) {
        const passage = entity.passages[0]
        if (passage.start && passage.start.b) {
          // Return the full book name from the parser
          return passage.start.b
        }
      }
    }

    // If parsing fails, fall back to the original book name
    return bookName
  } catch (error) {
    console.debug('Error parsing book name:', bookName, error)
    return bookName
  }
}
