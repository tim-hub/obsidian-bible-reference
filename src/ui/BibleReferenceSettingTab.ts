import {
  App,
  DropdownComponent,
  Notice,
  PluginSettingTab,
  Setting,
} from 'obsidian'
import BibleReferencePlugin from './../main'
import {
  BibleVersionCollection,
  DEFAULT_BIBLE_VERSION,
} from '../data/BibleVersionCollection'
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
import { FlagService } from '../provider/FeatureFlag'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { EventStats } from '../provider/EventStats'
import { APP_NAMING } from '../data/constants';

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

  setUpVersionSettingsAndVersionOptions = (containerEl: HTMLElement): void => {
    let allAvailableVersionOptions =
      this.getAllBibleVersionsWithLanguageNameAlphabetically()
    const disableBibleAPI =
      FlagService.instance.isFeatureEnabled('disable-bible-api')
    if (disableBibleAPI) {
      allAvailableVersionOptions = allAvailableVersionOptions.filter((v) => {
        return v.apiSource.name !== BibleAPISourceCollection.bibleApi.name
      })
    }
    if (
      disableBibleAPI &&
      !allAvailableVersionOptions.find(
        (v) => v.key === this.plugin.settings.bibleVersion
      )
    ) {
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
            EventStats.logSettingChange(
              'changeVersion',
              { key: value, value: 1 },
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  setUpReferenceLinkPositionOptions = (containerEl: HTMLElement): void => {
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
            EventStats.logSettingChange(
              'changeVerseFormatting',
              { key: `link-position-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents
            )
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
            EventStats.logSettingChange(
              'changeVerseFormatting',
              { key: `verse-format-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  setUpVerseNumberFormatOptions = (containerEl: HTMLElement): void => {
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
            EventStats.logSettingChange(
              'changeVerseFormatting',
              { key: `verse-number-format-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  setUpFormatOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Formatting String')
      .setDesc('Describes how to format the callout.')
      .addTextArea((text) => {
         text
            .setPlaceholder('')
            .setValue(this.plugin.settings.formatString)
            .onChange(async (value) => {
              this.plugin.settings.formatString = value;
              await this.plugin.saveSettings()
            })
          text.inputEl.style.height = '10em'
          text.inputEl.style.width = '30em'
        }
      )
  }

  setUpOptOutEventsOptions = (containerEl: HTMLElement): void => {
    new Setting(containerEl)
      .setName('Opt Out of Events Logging')
      .setDesc(
        'We used events logging to improve the plugin, this is very helpful for us, but if you want to opt out, you can do it here'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.optOutToEvents)
          .onChange(async (value) => {
            EventStats.logSettingChange(
              'others',
              { key: `opt-${value ? 'out' : 'in'}`, value: 1 },
              this.plugin.settings.optOutToEvents
            )
            this.plugin.settings.optOutToEvents = value
            await this.plugin.saveSettings()
            if (value) {
              new Notice(
                'You have opted out of events logging, we will not log any events from now on'
              )
            } else {
              new Notice(
                'Thanks for opting in to events logging, this is really valuable for us to improve the plugin'
              )
            }
          })
      )
  }

  async display(): Promise<void> {
    const { containerEl } = this
    containerEl.empty()
    const headingSection = containerEl.createDiv()
    headingSection.innerHTML = `
        <iframe src="https://github.com/sponsors/tim-hub/button" title="Sponsor Obsidian Bible Reference" width="116" height="32px" style="margin-right: 2em"/>
    `

    containerEl.createEl('h2', { text: 'General Settings' })
    this.setUpReferenceLinkPositionOptions(containerEl)
    this.setUpVerseFormatOptions(containerEl)
    this.setUpVerseNumberFormatOptions(containerEl)
    containerEl.createEl('h2', { text: 'Header/Footer Format'})
    containerEl.createEl('a', { text: 'View Available Formatting', href: 'https://github.com/tim-hub/obsidian-bible-reference#formatting-strings' })
    this.setUpFormatOptions(containerEl)
    containerEl.createEl('h1', { text: APP_NAMING.appName })
    this.setUpVersionSettingsAndVersionOptions(containerEl)

    containerEl.createEl('h2', { text: 'Verses Rendering' })
    this.setUpReferenceLinkPositionOptions(containerEl)
    this.setUpVerseFormatOptions(containerEl)
    this.setUpVerseNumberFormatOptions(containerEl)

    containerEl.createEl('h2', { text: 'Others' })

    this.setUpOptOutEventsOptions(containerEl)

    containerEl.createSpan({}, (span) => {
      span.innerHTML = `
        <a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a> |
        <a href="https://github.com/tim-hub/obsidian-bible-reference/blob/master/docs/privacy.md">Privacy Policy</a>
      `
    })
    EventStats.logUIOpen(
      'settingsOpen',
      { key: 'open', value: 1 },
      this.plugin.settings.optOutToEvents
    )
  }
}
