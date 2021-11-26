import { App, DropdownComponent, Notice, PluginSettingTab, Setting } from 'obsidian';
import { APP_NAMING } from './constants';
import BibleReferencePlugin from '../main';

export class BibleReferenceSettingTab extends PluginSettingTab {
  plugin: BibleReferencePlugin;

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let {containerEl} = this;

    containerEl.empty();
    containerEl.createEl('h2', {text: 'Settings for ' + APP_NAMING.appName});

    new Setting(containerEl)
      .setName('Language')
      .setDesc('Language')
      .addDropdown(
        (dropdown: DropdownComponent) => {
          dropdown
            .addOption('en', 'English')
            // .addOption('cn', 'Chinese(Simplified)')
            // .addOption('tw', 'Chinese(Traditional)');

          dropdown.setValue(this.plugin.settings.language)
            .onChange(async (value) => {
              this.plugin.settings.language = value;
              await this.plugin.saveSettings();
              new Notice('Bible Reference Settings Updated');
            });
        }
      );

    new Setting(containerEl)
      .setName('Bible Version')
      .setDesc('Bible Version')
      .addDropdown(
        (dropdown) => {
          dropdown
            .addOption('web', 'Web English Bible');
          dropdown.setValue(this.plugin.settings.version)
            .onChange(async (value) => {
              console.log('Bible Version: ' + value);
              this.plugin.settings.version = value;
              await this.plugin.saveSettings();
              new Notice('Bible Reference Settings Updated');
            });
        }
      )
  }
}
