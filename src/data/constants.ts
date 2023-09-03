import { BibleVersionCollection } from './BibleVersionCollection'
import { BibleVerseReferenceLinkPosition } from './BibleVerseReferenceLinkPosition'
import { BibleVerseFormat } from './BibleVerseFormat'
import { BibleVerseNumberFormat } from './BibleVerseNumberFormat'
import { CalloutFoldFormat } from './CalloutFoldFormat'

export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  bibleVersion: string
  formatString: string
  calloutDefaultFold: CalloutFoldFormat

  // Deprecated
  autoMigrate: boolean
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
  formatString: '> [!Bible] {{verse_reference_link}}\n{{content}}',
  calloutDefaultFold: CalloutFoldFormat.NoFold,

  // Deprecated
  autoMigrate: true,
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
