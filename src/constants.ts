export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  mySetting: string;
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  mySetting: 'default'
}

export const bibleRefRegex = new RegExp("(?:\\d+ ?)?[a-z]+ ?\\d+(?:(?::\\d+)?(?: ?- ?(?:\\d+ [a-z]+ )?\\d+(?::\\d+)?)?)?");
