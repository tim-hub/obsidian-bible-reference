import {
  App,
  DropdownComponent,
  Notice,
  PluginSettingTab,
  Setting,
} from 'obsidian'
import BibleReferencePlugin from './../main'
import { BibleVersionCollection, DEFAULT_BIBLE_VERSION } from '../data/BibleVersionCollection'
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
import getFlags from '../provider/FeatureFlag'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection';
import  { EventStats } from '../provider/EventStats';

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

  setUpVersionSettingsAndVersionOptions = (containerEl: HTMLElement, disableBibleAPI?: boolean): void => {
    let allAvailableVersionOptions = this.getAllBibleVersionsWithLanguageNameAlphabetically()
    if (disableBibleAPI ) {
      allAvailableVersionOptions = allAvailableVersionOptions.filter(
        v => {
          return v.apiSource.name !== BibleAPISourceCollection.bibleApi.name
        })
    }
    if (disableBibleAPI && !allAvailableVersionOptions.find(v => v.key === this.plugin.settings.bibleVersion) ) {
      this.plugin.settings.bibleVersion = DEFAULT_BIBLE_VERSION.key
    }

    new Setting(containerEl)
      .setName('Default Bible Version')
      .setDesc('Choose the Bible version you prefer')
      .addDropdown((dropdown) => {
        allAvailableVersionOptions.forEach((version: IBibleVersion) => {
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
            new Notice(`Bible Reference - use Version ${value.toUpperCase()}`)
            EventStats.logSettingChange('changeVersion', {key:value, value:1})
          })
      })
  }

  setUpReferenceLinkPositionOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Reference Link Position')
      .setDesc('Where to put the bible verse reference link of the bible')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseReferenceLinkPositionCollection.forEach(
          ({name, description}) => {
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
            EventStats.logSettingChange('changeVerseFormatting', {key:`link-position-${value}`, value:1})
          })
      })
  }

  setUpVerseFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Formatting Options')
      .setDesc(
        'Sets how to format the verses in Obsidian, either line by line or in 1 paragraph'
      )
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseFormatCollection.forEach(({name, description}) => {
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
            EventStats.logSettingChange('changeVerseFormatting', {key:`verse-format-${value}`, value:1})
          })
      })
  }

  setUpVerseNumberFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Verse Number Formatting Options')
      .setDesc('Sets how to format the verse numbers in Obsidian')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseNumberFormatCollection.forEach(({name, description}) => {
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
            EventStats.logSettingChange('changeVerseFormatting', {key:`verse-number-format-${value}`, value:1})
          })
      })
  }

  setUpCollapsible = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Make Verses Collapsible')
      .setDesc('Make the rendered verses collapsible')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.collapsibleVerses)
          .onChange((value) => {
            this.plugin.settings.collapsibleVerses = value
            this.plugin.saveData(this.plugin.settings)
            EventStats.logSettingChange('changeVerseFormatting', {key:`collapsible-${value}`, value:1})
          })
      )
  }

  setUpBookTagging = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Add a Book Tag')
      .setDesc('Add a hidden book tag at bottom, for example #John')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.bookTagging)
          .onChange((value) => {
            this.plugin.settings.bookTagging = value
            this.plugin.saveData(this.plugin.settings)
            EventStats.logSettingChange('changeVerseFormatting', {key:`book-tagging-${value}`, value:1})
          })
      )
  }

  setUpChapterTagging = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Add a Chapter Tag')
      .setDesc('Add a hidden chapter tag at bottom, for example #John1')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.chapterTagging)
          .onChange((value) => {
            this.plugin.settings.chapterTagging = value
            this.plugin.saveData(this.plugin.settings)
            EventStats.logSettingChange('changeVerseFormatting', {key:`chapter-tagging-${value}`, value:1})
          })
      )
  }

  async display(): Promise<void> {
    const {containerEl} = this
    EventStats.logUIOpen('settingsOpen', {key: 'open', value: 1})
    containerEl.empty()
    const headingSection = containerEl.createDiv()
    headingSection.innerHTML = `
        <iframe src="https://github.com/sponsors/tim-hub/button" title="Sponsor Obsidian Bible Reference" width="116" height="32px" style="margin-right: 2em"/>
    `

    const flags = await getFlags()

    containerEl.createEl('h2', {text: 'General Settings'})
    this.setUpVersionSettingsAndVersionOptions(containerEl, flags.isFeatureEnabled('disable-bible-api'))
    containerEl.createEl('h2', {text: 'Verses Rendering'})
    this.setUpReferenceLinkPositionOptions(containerEl)
    this.setUpVerseFormatOptions(containerEl)
    this.setUpVerseNumberFormatOptions(containerEl)
    this.setUpCollapsible(containerEl)
    containerEl.createEl('h2', {text: 'Tagging and Linking Settings'})
    containerEl.createSpan({}, (span) => {
      span.innerHTML = `
        <small>Only if you want to add tags at the bottom of verses</small>
      `
    })
    this.setUpBookTagging(containerEl)
    this.setUpChapterTagging(containerEl)

    if (flags.isFeatureEnabled('vod')) {
      // todo add vod settings and reflect feature flags
    }

    containerEl.createEl('h2', {text: 'About'})

    containerEl.createSpan({}, (span) => {
      span.innerHTML = `
        <a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a>
      `
    })
  }
}
