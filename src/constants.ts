export const APP_NAMING = {
  appName: 'Bible Reference',
  appAuthor: 'tim-hub',
  appUrl: '',
  defaultStatus: '',
}

export interface BibleReferencePluginSettings {
  language: string;
  version: string;
}

export const DEFAULT_SETTINGS: BibleReferencePluginSettings = {
  language: 'en',
  version: 'web' //World English Bible
}
