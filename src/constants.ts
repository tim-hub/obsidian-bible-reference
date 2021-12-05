import { BibleLanguageToVersionsCollection } from './data/BibleLanguageToVersionsCollection';

export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  // language?: string; // we might not need this todo remove it
  languagePlusVersion: string;
}

export const LanguageVersionSplitter = '+++@@@+++';

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  languagePlusVersion: `${BibleLanguageToVersionsCollection[0].id}${LanguageVersionSplitter}${BibleLanguageToVersionsCollection[0].versions[0].id}`,
}
