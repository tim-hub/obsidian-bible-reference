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

  SetUpTextOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Make Verses Collapsible')
      .setDesc('Make the inserted verses collapsible')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.collapsibleVerses)
          .onChange((value) => {
            this.plugin.settings.collapsibleVerses = value
            this.plugin.saveData(this.plugin.settings)
          })
      )
  }

  SetUpBibleTagging = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Create Bible Tags')
      .setDesc('Makes hidden #bible tag')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.bibleTagging)
          .onChange((value) => {
            this.plugin.settings.bibleTagging = value
            this.plugin.saveData(this.plugin.settings)
          })
      )
  }

  SetUpBookTagging = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Create Book Tags')
      .setDesc('Makes hidden #{book} tag')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.bookTagging)
          .onChange((value) => {
            this.plugin.settings.bookTagging = value
            this.plugin.saveData(this.plugin.settings)
          })
      )
  }

  SetUpChapterTagging = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Create Chapter Tags')
      .setDesc('Makes hidden #{book_chapter} tag')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.chapterTagging)
          .onChange((value) => {
            this.plugin.settings.chapterTagging = value
            this.plugin.saveData(this.plugin.settings)
          })
      )
  }

  SetUpBookBacklinking = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Create Book Backlink')
      .setDesc('Makes [[{book}]] link')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.bookBacklinking)
          .onChange((value) => {
            this.plugin.settings.bookBacklinking = value
            this.plugin.saveData(this.plugin.settings)
          })
      )
  }

  SetUpChapterBacklinking = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Create Chapter Backlink')
      .setDesc('Makes [[{book_chapter}]] link')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.chapterBacklinking)
          .onChange((value) => {
            this.plugin.settings.chapterBacklinking = value
            this.plugin.saveData(this.plugin.settings)
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
    this.SetUpTextOptions(containerEl)
    containerEl.createEl('h2', { text: 'Tagging and Linking Settings' })
    this.SetUpBibleTagging(containerEl)
    this.SetUpBookTagging(containerEl)
    this.SetUpChapterTagging(containerEl)
    this.SetUpBookBacklinking(containerEl)
    this.SetUpChapterBacklinking(containerEl)

    containerEl.createEl('h2', { text: 'About' })

    containerEl.createSpan({}, (span) => {
      span.innerHTML = `
        <a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a>
      `
    })
  }
}
