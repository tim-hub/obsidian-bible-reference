import { BibleVersionCollection } from './BibleVersionCollection';
import { BibleVerseReferenceLinkPosition } from './BibleVerseReferenceLinkPosition';

export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  bibleVersion: string;
  referenceLinkPosition?: BibleVerseReferenceLinkPosition;
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  bibleVersion: BibleVersionCollection[0].key,
  referenceLinkPosition: BibleVerseReferenceLinkPosition.Header,
}
