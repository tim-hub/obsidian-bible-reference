import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { APP_NAMING } from '../data/constants';
import BibleReferencePlugin from './../main';
import { BibleVersionCollection } from '../data/BibleVersionCollection';
import { IBibleVersion } from '../interfaces/IBibleVersion';

export class BibleReferenceSettingTab extends PluginSettingTab {
  plugin: BibleReferencePlugin;

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getAllBibleVersionsWithLanguageNameAlphabetically = (): IBibleVersion[] => {
    return this.getAllBibleVersionsWithLanguageName()
      .sort((a, b) => {
          // sort by language and versionName alphabetically
          const languageCompare = a.language.localeCompare(b.language);
          if (languageCompare === 0) {
            return a.versionName.localeCompare(b.versionName);
          } else {
            return languageCompare;
          }
        }
      );
  }

  getAllBibleVersionsWithLanguageName = (): IBibleVersion[] => {
    return BibleVersionCollection;
  }

  SetUpVersionSettingsAndVersionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Default Bible Version')
      .setDesc('Choose the Bible Version You Prefer')
      .addDropdown(
        (dropdown) => {
          const allVersionOptions = this.getAllBibleVersionsWithLanguageNameAlphabetically();
          allVersionOptions.forEach((version: IBibleVersion) => {
            dropdown.addOption(version.key, `${version.language} - ${version.versionName}`);
          });
          dropdown.setValue(this.plugin.settings.bibleVersion)
            .onChange(async (value) => {
                this.plugin.settings.bibleVersion = value;
                console.debug('Default Bible Version: ' + value);
                await this.plugin.saveSettings();
                new Notice('Bible Reference Settings Updated ');
              }
            );
        }
      );
  }

  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h2', {text: 'Settings for ' + APP_NAMING.appName});
    this.SetUpVersionSettingsAndVersionOptions(containerEl);
    containerEl.createEl('br');
    containerEl.createEl('p', {text: 'The back-end is powered by Bible-Api.com and Bolls.life/API, at current stage the performance from Bolls.life/API might be a bit slow.'});
    containerEl.createEl('br');
    containerEl.createEl('p', {text: 'For Chinese CUV Version, at current stage, it is required to use English book name for input.'});

  }
}

