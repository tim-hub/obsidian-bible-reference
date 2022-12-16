import { App, DropdownComponent, Notice, PluginSettingTab, Setting, ToggleComponent } from 'obsidian';
import { APP_NAMING } from '../data/constants';
import BibleReferencePlugin from './../main';
import { BibleVersionCollection } from '../data/BibleVersionCollection';
import { IBibleVersion } from '../interfaces/IBibleVersion';
import { BibleVerseReferenceLinkPosition, BibleVerseReferenceLinkPositionCollection } from '../data/BibleVerseReferenceLinkPosition';

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
            dropdown.addOption(version.key, `${version.language} - ${version.versionName} @${version.apiSource.name}`);
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

  SetUpReferenceLinkPositionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Reference Link Position')
      .setDesc('Where to put the bible verse reference link of the bible')
      .addDropdown(
        (dropdown: DropdownComponent) => {
          BibleVerseReferenceLinkPositionCollection.forEach(({name, description}) => {
            dropdown.addOption(name, description);
          });
          dropdown.setValue(this.plugin.settings.referenceLinkPosition ?? BibleVerseReferenceLinkPosition.Bottom).onChange(
            async (value) => {
              this.plugin.settings.referenceLinkPosition = value as BibleVerseReferenceLinkPosition;
              console.debug('Bible Verse Reference Link Position: ' + value);
              await this.plugin.saveSettings();
              new Notice('Bible Reference Settings Updated ');
            }
          )
        }
      )
  }

  SetUpTextoptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Make Verses Collapsible')
      .setDesc('Make the inserted verses collapsible')
      .addToggle(toggle => toggle.setValue(!!this.plugin.settings?.collapsibleVerses)
      .onChange((value) => {
        this.plugin.settings.collapsibleVerses = value;
        this.plugin.saveData(this.plugin.settings);
      }));
  }

  display(): void {
    let {containerEl} = this;
    containerEl.empty();
    containerEl.createEl('h2', {text: 'Settings for ' + APP_NAMING.appName});
    this.SetUpVersionSettingsAndVersionOptions(containerEl);
    this.SetUpReferenceLinkPositionOptions(containerEl);
    this.SetUpTextoptions(containerEl);
    containerEl.createEl('br');
    containerEl.createEl('p', {text: 'The back-end is powered by Bible-Api.com and Bolls.life/API, at current stage the performance from Bolls.life/API might be a bit slow.'});
    containerEl.createEl('br');
    containerEl.createEl('p', {text: 'For Non-English Bible Versions, at current stage, it is required to use English book name for input.'});

  }
}

