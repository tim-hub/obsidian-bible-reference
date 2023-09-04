import { DEFAULT_BIBLE_VERSION } from './BibleVersionCollection'
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
  referenceLinkPosition?: BibleVerseReferenceLinkPosition
  verseFormatting?: BibleVerseFormat
  verseNumberFormatting?: BibleVerseNumberFormat
  collapsibleVerses?: boolean
  bookTagging?: boolean
  chapterTagging?: boolean

  // add this to ui at some point todo
  enableBibleVerseLookupRibbon?: boolean
  optOutToEvents?: boolean
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  bibleVersion: DEFAULT_BIBLE_VERSION.key,
  referenceLinkPosition: BibleVerseReferenceLinkPosition.Header,
  verseFormatting: BibleVerseFormat.SingleLine,
  verseNumberFormatting: BibleVerseNumberFormat.Period,
  collapsibleVerses: false,
  bookTagging: false,
  chapterTagging: false,
  enableBibleVerseLookupRibbon: false,
  optOutToEvents: false,
}

export const API_WAITING_LABEL = 'Loading...'
