import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { APP_NAMING, LanguageVersionSplitter } from './constants';
import BibleReferencePlugin from '../main';
import {
  BibleLanguageToVersionsCollection,
  IBibleLanguageToVersions,
  IVersion
} from './data/BibleLanguageToVersionsCollection';

interface ILanguageVersion {
  versionId: string;
  displayName: string; // with language
}

export class BibleReferenceSettingTab extends PluginSettingTab {
  plugin: BibleReferencePlugin;

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getAllBibleVersionsWithLanguageNameAlphabetically = (): ILanguageVersion[] => {
    return this.getAllBibleVersionsWithLanguageName()
      .sort((a, b) => {
          // sort by displayName alphabetically
          return a.displayName.localeCompare(b.displayName);
        }
      );
  }

  getAllBibleVersionsWithLanguageName = (): ILanguageVersion[] => {
    const allVersionOptions = BibleLanguageToVersionsCollection.map(
      (bibleLanguageToVersion: IBibleLanguageToVersions,) => {
        return bibleLanguageToVersion.versions.map((version: IVersion) => {
          return {
            displayName: `${bibleLanguageToVersion.name} - ${version.name}`, // add language
            versionId: `${bibleLanguageToVersion.id}${LanguageVersionSplitter}${version.id}`
          };
        });
      }
    )
      .flat() // flat two dimension to one
    return allVersionOptions;
  }

  SetUpVersionSettingsAndVersionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Bible Version')
      .setDesc('Choose the Bible Version You Prefer')
      .addDropdown(
        (dropdown) => {
          const allVersionOptions = this.getAllBibleVersionsWithLanguageNameAlphabetically();
          allVersionOptions.forEach((version: ILanguageVersion) => {
            dropdown.addOption(version.versionId, version.displayName);
          });

          dropdown.setValue(this.plugin.settings.languagePlusVersion)
            .onChange(async (value) => {
                this.plugin.settings.languagePlusVersion = value;
                console.log('Bible Version: ' + value);
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
  }
}

