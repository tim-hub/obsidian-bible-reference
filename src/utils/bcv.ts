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

export const bcv = new bcv_parser(lang)

bcv.set_options({
  book_alone_strategy: 'full',
  book_sequence_strategy: 'include',
})
