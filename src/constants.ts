export const APP_SETTINGS = {
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
