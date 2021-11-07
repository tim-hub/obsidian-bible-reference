import { Editor, EditorPosition, MarkdownView, Notice, Plugin } from 'obsidian';
import { APP_NAMING, BibleReferencePluginSettings, DEFAULT_SETTINGS } from './src/constants';
import { BibleReferenceSettingTab } from './src/BibleReferenceSettingTab';
import { BibleReferenceModal } from './src/BibleReferenceModal';
import { VerseSuggester } from './src/VerseSuggester';


export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings;

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName);

    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('dice', APP_NAMING.appName, (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      new Notice('Thanks for using '+APP_NAMING.appName);
    });
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('bible-reference-plugin-ribbon-class');

    this.addSettingTab(new BibleReferenceSettingTab(this.app, this));


    this.registerEditorSuggest(new VerseSuggester(this));

    this.registerEvent(this.app.workspace.on('quit', () => {
      console.log('editor quit');
    }));
  }

  onunload() {
    console.log('unloading plugin', APP_NAMING.appName);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
