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
  defaultBibleVersion: string
  referenceLinkPosition?: BibleVerseReferenceLinkPosition
  verseFormatting?: BibleVerseFormat
  verseNumberFormatting?: BibleVerseNumberFormat
  collapsibleVerses?: boolean // this is binging to displayBibleIconPrefixAtHeader option
  enableHyperlinking?: boolean
  showVerseTranslation?: boolean
  bookTagging?: boolean
  chapterTagging?: boolean
  bookBacklinking?: OutgoingLinkPositionEnum // this is refering to outgoing link
  chapterBacklinking?: OutgoingLinkPositionEnum // this is refering to outgoing link

  // add this to ui at some point todo
  enableBibleVerseLookupRibbon?: boolean
  optOutToEvents?: boolean

  advancedSettings?: boolean
  bibleVersionStatusIndicator?: BibleVersionNameLengthEnum
  displayBibleIconPrefixAtHeader?: boolean // this is binding to to header collapsible option
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  bibleVersion: DEFAULT_BIBLE_VERSION.key,
  defaultBibleVersion: DEFAULT_BIBLE_VERSION.key,
  referenceLinkPosition: BibleVerseReferenceLinkPosition.Header,
  verseFormatting: BibleVerseFormat.SingleLine,
  verseNumberFormatting: BibleVerseNumberFormat.Period,
  collapsibleVerses: false,
  enableHyperlinking: true,
  showVerseTranslation: true,
  bookTagging: false,
  chapterTagging: false,
  enableBibleVerseLookupRibbon: false,
  optOutToEvents: false,
  bookBacklinking: OutgoingLinkPositionEnum.None,
  chapterBacklinking: OutgoingLinkPositionEnum.None,
  bibleVersionStatusIndicator: BibleVersionNameLengthEnum.Short,
  displayBibleIconPrefixAtHeader: true,
}

export const API_WAITING_LABEL = 'Loading...'
