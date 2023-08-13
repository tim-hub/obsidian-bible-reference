import { BibleVersionCollection } from './BibleVersionCollection'
import { BibleVerseReferenceLinkPosition } from './BibleVerseReferenceLinkPosition'
import { BibleVerseFormat } from './BibleVerseFormat'
import { BibleVerseNumberFormat } from './BibleVerseNumberFormat'

export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  bibleVersion: string
  headFormatString: string
  tailFormatString: string

  // Deprecated
  referenceLinkPosition?: BibleVerseReferenceLinkPosition
  verseFormatting?: BibleVerseFormat
  verseNumberFormatting?: BibleVerseNumberFormat
  collapsibleVerses?: boolean
  bibleTagging?: boolean
  bookTagging?: boolean
  chapterTagging?: boolean
  bookBacklinking?: boolean
  chapterBacklinking?: boolean
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  bibleVersion: BibleVersionCollection[0].key,
  headFormatString: '',
  tailFormatString: '',

  // Deprecated
  referenceLinkPosition: BibleVerseReferenceLinkPosition.Header,
  verseFormatting: BibleVerseFormat.SingleLine,
  verseNumberFormatting: BibleVerseNumberFormat.Period,
  collapsibleVerses: false,
  bibleTagging: false,
  bookTagging: false,
  chapterTagging: false,
  bookBacklinking: false,
  chapterBacklinking: false
}

export const API_WAITING_LABEL = 'Loading...';

export const REFERENCE_STRING_EXPLANATION =
  'Available Formatting: {{bible_version}} {{book}} {{chapter}} {{verse_reference_link}}'
