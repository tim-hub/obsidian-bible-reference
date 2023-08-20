import {
  App,
  DropdownComponent,
  Notice,
  PluginSettingTab,
  Setting,
} from 'obsidian'
import BibleReferencePlugin from './../main'
import { BibleVersionCollection } from '../data/BibleVersionCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import {
  BibleVerseReferenceLinkPosition,
  BibleVerseReferenceLinkPositionCollection,
} from '../data/BibleVerseReferenceLinkPosition'
import {
  BibleVerseFormat,
  BibleVerseFormatCollection,
} from '../data/BibleVerseFormat'
import {
  BibleVerseNumberFormat,
  BibleVerseNumberFormatCollection,
} from '../data/BibleVerseNumberFormat'
import { CalloutFoldFormat, CalloutFoldFormatCollection } from 'src/data/CalloutFoldFormat'
import { migrateSettings } from 'src/utils/SettingsMigration'

export class BibleReferenceSettingTab extends PluginSettingTab {
  plugin: BibleReferencePlugin

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  getAllBibleVersionsWithLanguageNameAlphabetically = (): IBibleVersion[] => {
    return this.getAllBibleVersionsWithLanguageName().sort((a, b) => {
      // sort by language and versionName alphabetically
      const languageCompare = a.language.localeCompare(b.language)
      if (languageCompare === 0) {
        return a.versionName.localeCompare(b.versionName)
      } else {
        return languageCompare
      }
    })
  }

  getAllBibleVersionsWithLanguageName = (): IBibleVersion[] => {
    return BibleVersionCollection
  }

  SetUpVersionSettingsAndVersionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Default Bible Version')
      .setDesc('Choose the Bible version you prefer')
      .addDropdown((dropdown) => {
        const allVersionOptions =
          this.getAllBibleVersionsWithLanguageNameAlphabetically()
        allVersionOptions.forEach((version: IBibleVersion) => {
          dropdown.addOption(
            version.key,
            `${version.language} - ${version.versionName} @${version.apiSource.name}`
          )
        })
        dropdown
          .setValue(this.plugin.settings.bibleVersion)
          .onChange(async (value) => {
            this.plugin.settings.bibleVersion = value
            console.debug('Default Bible Version: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Reference Settings Updated ')
          })
      })
  }

  SetUpReferenceLinkPositionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Reference Link Position')
      .setDesc('Where to put the bible verse reference link of the bible')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseReferenceLinkPositionCollection.forEach(
          ({ name, description }) => {
            dropdown.addOption(name, description)
          }
        )
        dropdown
          .setValue(
            this.plugin.settings.referenceLinkPosition ??
              BibleVerseReferenceLinkPosition.Bottom
          )
          .onChange(async (value) => {
            this.plugin.settings.referenceLinkPosition =
              value as BibleVerseReferenceLinkPosition
            console.debug('Bible Verse Reference Link Position: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Reference Settings Updated ')
          })
      })
  }

  SetUpVerseFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Formatting Options')
      .setDesc(
        'Sets how to format the verses in Obsidian, either line by line or in 1 paragraph'
      )
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseFormatCollection.forEach(({ name, description }) => {
          dropdown.addOption(name, description)
        })
        dropdown
          .setValue(
            this.plugin.settings.verseFormatting ?? BibleVerseFormat.SingleLine
          )
          .onChange(async (value) => {
            this.plugin.settings.verseFormatting = value as BibleVerseFormat
            console.debug('Bible Verse Format To: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Verse Format Settings Updated')
          })
      })
  }

  SetUpVerseNumberFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Number Formatting Options')
      .setDesc('Sets how to format the verse numbers in Obsidian')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseNumberFormatCollection.forEach(({ name, description }) => {
          dropdown.addOption(name, description)
        })
        dropdown
          .setValue(
            this.plugin.settings.verseNumberFormatting ??
              BibleVerseNumberFormat.Period
          )
          .onChange(async (value) => {
            this.plugin.settings.verseNumberFormatting =
              value as BibleVerseNumberFormat
            console.debug('Bible Verse Number Format To: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Verse Format Number Settings Updated')
          })
      })
  }

  SetUpFoldOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Callout Default Folding')
      .setDesc('Sets the state of generated callouts upon opening a note')
      .addDropdown((dropdown: DropdownComponent) => {
        CalloutFoldFormatCollection.forEach(({ name, description }) => {
          dropdown.addOption(name, description)
        });
        dropdown
          .setValue(
            this.plugin.settings.calloutDefaultFold ?? CalloutFoldFormat.NoFold
          )
          .onChange(async (value) => {
            this.plugin.settings.calloutDefaultFold = value as CalloutFoldFormat
            console.debug('Callout Default Folding To: ' + value)
            await this.plugin.saveSettings()
            new Notice('Callout Default Folding Updated')
          })
      })
  }

  SetUpHeaderFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Header Formatting String')
      .setDesc('Describes how to format the header of the callout.')
      .addTextArea((text) => 
        text
          .setPlaceholder('')
          .setValue(this.plugin.settings.headFormatString)
          .onChange(async (value) => {
            this.plugin.settings.headFormatString = value;
            console.debug('Header Format String To:' + value)
            await this.plugin.saveSettings()
          })
      )
  }

  SetUpFooterFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Footer Formatting String')
      .setDesc('Describes how to format the footer of the callout.')
      .addTextArea((text) => 
        text
          .setPlaceholder('')
          .setValue(this.plugin.settings.tailFormatString)
          .onChange(async (value) => {
            this.plugin.settings.tailFormatString = value;
            console.debug('Footer Format String To:' + value)
            await this.plugin.saveSettings()
          })
      )
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    const headingSection = containerEl.createDiv()
    headingSection.innerHTML = `
        <iframe src="https://github.com/sponsors/tim-hub/button" title="Sponsor Obsidian Bible Reference" width="116" height="32px" style="margin-right: 2em"/>
    `

    containerEl.createEl('h2', { text: 'General Settings' })
    this.SetUpVersionSettingsAndVersionOptions(containerEl)
    this.SetUpReferenceLinkPositionOptions(containerEl)
    this.SetUpVerseFormatOptions(containerEl)
    this.SetUpVerseNumberFormatOptions(containerEl)
    this.SetUpFoldOptions(containerEl)
    containerEl.createEl('h2', { text: 'Header/Footer Format'})
    containerEl.createEl('a', { text: 'View Available Formatting', href: 'https://github.com/tim-hub/obsidian-bible-reference#formatting-strings' })
    this.SetUpHeaderFormatOptions(containerEl)
    this.SetUpFooterFormatOptions(containerEl)

    containerEl.createEl('h2', { text: 'About' })

    containerEl.createSpan({}, (span) => {
      span.innerHTML = `
        <a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a>
      `
    })
  }
}
