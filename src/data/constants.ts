import { BibleVersionCollection } from './BibleVersionCollection';
import { BibleVerseReferenceLinkPosition } from './BibleVerseReferenceLinkPosition';
import { BibleVerseFormat } from './BibleVerseFormat';
import { BibleVerseNumberFormat } from './BibleVerseNumberFormat';

export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  bibleVersion: string;
  referenceLinkPosition?: BibleVerseReferenceLinkPosition;
  verseFormatting?: BibleVerseFormat;
  verseNumberFormatting?: BibleVerseNumberFormat;
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  bibleVersion: BibleVersionCollection[0].key,
  referenceLinkPosition: BibleVerseReferenceLinkPosition.Header,
  verseFormatting: BibleVerseFormat.SingleLine,
  verseNumberFormatting: BibleVerseNumberFormat.Period,
}
