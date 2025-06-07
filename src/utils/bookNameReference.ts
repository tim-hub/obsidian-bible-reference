import { bcv_parser } from 'bible-passage-reference-parser'

const bcv = new bcv_parser()

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
