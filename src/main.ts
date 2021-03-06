import { Plugin } from 'obsidian';
import { APP_NAMING, BibleReferencePluginSettings, DEFAULT_SETTINGS } from './data/constants';
import { BibleReferenceSettingTab } from './ui/BibleReferenceSettingTab';
import { VerseEditorSuggestor } from './VerseEditorSuggestor';


export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings;

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName);

    await this.loadSettings();
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this));
    this.registerEditorSuggest(new VerseEditorSuggestor(this, this.settings));
  }

  onunload() {
    console.log('unloading plugin', APP_NAMING.appName);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    console.debug(this.settings);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
