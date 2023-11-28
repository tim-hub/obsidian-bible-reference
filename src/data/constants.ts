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

export enum OutgoingLinkPositionEnum {
  Header = BibleVerseReferenceLinkPosition.Header,
  Bottom = BibleVerseReferenceLinkPosition.Bottom,
  None = BibleVerseReferenceLinkPosition.None,
}

export enum BibleVersionNameLengthEnum {
  Full = 'Full',
  Short = 'Short',
  Hide = 'Hide',
}

export interface BibleReferencePluginSettings {
  bibleVersion: string
  referenceLinkPosition?: BibleVerseReferenceLinkPosition
  verseFormatting?: BibleVerseFormat
  verseNumberFormatting?: BibleVerseNumberFormat
  collapsibleVerses?: boolean
  bookTagging?: boolean
  chapterTagging?: boolean
  bookBacklinking?: OutgoingLinkPositionEnum // this is refering to outgoing link
  chapterBacklinking?: OutgoingLinkPositionEnum // this is refering to outgoing link

  // add this to ui at some point todo
  enableBibleVerseLookupRibbon?: boolean
  optOutToEvents?: boolean

  advancedSettings?: boolean
  bibleVersionStatusIndicator?: BibleVersionNameLengthEnum
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
  bookBacklinking: OutgoingLinkPositionEnum.None,
  chapterBacklinking: OutgoingLinkPositionEnum.None,
  bibleVersionStatusIndicator: BibleVersionNameLengthEnum.Short,
}

export const API_WAITING_LABEL = 'Loading...'
