import {
  App,
  DropdownComponent,
  Notice,
  PluginSettingTab,
  Setting,
} from 'obsidian'
import BibleReferencePlugin from './../main'
import {
  allBibleVersionsWithLanguageNameAlphabetically,
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
import { APP_NAMING, OutgoingLinkPositionEnum } from '../data/constants'
import { pluginEvent } from '../obsidian/PluginEvent';

export class BibleReferenceSettingTab extends PluginSettingTab {
  private plugin: BibleReferencePlugin
  private expertSettingContainer?: HTMLElement;

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  public async display(): Promise<void> {
    this.containerEl.empty()
    this.startListeningToEvents()
    const headingSection = this.containerEl.createDiv()
    headingSection.innerHTML = `
        <iframe src="https://github.com/sponsors/tim-hub/button" title="Sponsor Obsidian Bible Reference" width="116" height="32px" style="margin-right: 2em"/>
    `

    this.containerEl.createEl('h1', {text: APP_NAMING.appName})
    this.setUpVersionSettingsAndVersionOptions()

    this.containerEl.createEl('h2', {text: 'Verses Rendering'})
    this.setUpReferenceLinkPositionOptions()
    this.setUpVerseFormatOptions()
    this.setUpVerseNumberFormatOptions()
    this.setUpCollapsible()
    this.setUpExpertSettings();
    this.containerEl.createEl('h2', {text: 'Others'})

    this.setUpOptOutEventsOptions()

    this.containerEl.createSpan({}, (span) => {
      span.innerHTML = `
<a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a> |
<a href="https://github.com/tim-hub/obsidian-bible-reference/blob/master/docs/privacy.md">Privacy Policy</a> |
<a href="https://github.com/sponsors/tim-hub/button">Support</a>
    `
    })

    this.expertSettingContainer = this.containerEl.createDiv()
    if (this.plugin.settings.advancedSettings) {
      this.displayExpertSettings();
    }
    EventStats.logUIOpen(
      'settingsOpen',
      {key: 'open', value: 1},
      this.plugin.settings.optOutToEvents
    )
  }

  private startListeningToEvents(): void {
    pluginEvent.on('bible-reference:settings:advanced', (value: boolean) => {
      console.log('advanced', value)
      if (this.plugin.settings.advancedSettings) {
        this.displayExpertSettings();
      } else {
        this.expertSettingContainer && this.expertSettingContainer.empty();
      }
    })
  }

  private displayExpertSettings(): void {
    if (this.expertSettingContainer) {
      this.expertSettingContainer.createEl('hr')
      this.expertSettingContainer.createEl('h2', {text: 'Expert Settings'})
      this.expertSettingContainer.createEl('h5', {text: 'Tagging and Linking Settings'})
      this.expertSettingContainer.createSpan({}, (span) => {
        span.innerHTML = `
        <small>Only if you want to add tags at the bottom of verses</small>
      `
      })

      new Setting(this.expertSettingContainer)
        .setName('Add a Book Tag')
        .setDesc('Add a hidden book tag at bottom, for example #John')
        .addToggle((toggle) =>
          toggle
            .setValue(!!this.plugin.settings?.bookTagging)
            .onChange(async (value) => {
                this.plugin.settings.bookTagging = value
                await this.plugin.saveSettings()
                EventStats.logSettingChange(
                  'changeVerseFormatting',
                  {key: `book-tagging-${value}`, value: 1},
                  this.plugin.settings.optOutToEvents
                )
              }
            )
        )
      new Setting(this.expertSettingContainer)
        .setName('Add a Chapter Tag')
        .setDesc('Add a hidden chapter tag at bottom, for example #John1')
        .addToggle((toggle) =>
          toggle
            .setValue(!!this.plugin.settings?.chapterTagging)
            .onChange(async (value) => {
                this.plugin.settings.chapterTagging = value
                await this.plugin.saveSettings()
                EventStats.logSettingChange(
                  'changeVerseFormatting',
                  {key: `chapter-tagging-${value}`, value: 1},
                  this.plugin.settings.optOutToEvents
                )
              }
            )
        )

      new Setting(this.expertSettingContainer)
        .setName('Add a Book Outgoing Link')
        .setDesc('Makes an outgoing link for the book, for example [[John]]')
        .addDropdown((dropdown) => {
          Object.keys(OutgoingLinkPositionEnum).forEach(
            (name) => {
              dropdown.addOption(name, name)
            }
          )
          const defaultPosition = this.plugin.settings?.bookBacklinking as any === true ? OutgoingLinkPositionEnum.Header : OutgoingLinkPositionEnum.None
          const value: string = (this.plugin.settings?.bookBacklinking && this.plugin.settings?.bookBacklinking as any !== true ? this.plugin.settings.bookBacklinking : defaultPosition) as string
          dropdown.setValue(value)
          dropdown.onChange(async (value) => {
            this.plugin.settings.bookBacklinking = value as OutgoingLinkPositionEnum
            await this.plugin.saveSettings()
          })
        })

      new Setting(this.expertSettingContainer)
        .setName('Add a Chapter Outgoing Links')
        .setDesc('Makes an outgoing link for the chapter, for example [[John1]] ')
        .addDropdown((dropdown) => {
          Object.keys(OutgoingLinkPositionEnum).forEach(
            (name) => {
              dropdown.addOption(name, name)
            }
          )
          const defaultPosition = this.plugin.settings?.chapterBacklinking as any === true ? OutgoingLinkPositionEnum.Header : OutgoingLinkPositionEnum.None
          const value: string = (this.plugin.settings?.chapterBacklinking && this.plugin.settings?.chapterBacklinking as any !== true ? this.plugin.settings.chapterBacklinking : defaultPosition) as string
          dropdown.setValue(value)
          dropdown.onChange(async (value) => {
            this.plugin.settings.chapterBacklinking = value as OutgoingLinkPositionEnum
            await this.plugin.saveSettings()
          })
        })
    }
  }

  private setUpVersionSettingsAndVersionOptions(): void {
    let allAvailableVersionOptions = allBibleVersionsWithLanguageNameAlphabetically
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

    new Setting(this.containerEl)
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
            pluginEvent.trigger('bible-reference:settings:version', [value])
            new Notice(`Bible Reference - use Version ${value.toUpperCase()}`)
            EventStats.logSettingChange(
              'changeVersion',
              {key: value, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  private setUpReferenceLinkPositionOptions(): void {
    new Setting(this.containerEl)
      .setName('Verse Reference Link Position')
      .setDesc('Where to put the reference link of the Bible')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseReferenceLinkPositionCollection.forEach(
          ({name, description}) => {
            dropdown.addOption(name, description)
          }
        )
        dropdown
          .setValue(
            this.plugin.settings.referenceLinkPosition ??
            BibleVerseReferenceLinkPosition.None
          )
          .onChange(async (value) => {
            this.plugin.settings.referenceLinkPosition =
              value as BibleVerseReferenceLinkPosition
            console.debug('Bible Verse Reference Link Position: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Reference Settings Updated ')
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `link-position-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  private setUpVerseFormatOptions(): void {
    new Setting(this.containerEl)
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
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `verse-format-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  private setUpVerseNumberFormatOptions(): void {
    new Setting(this.containerEl)
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
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `verse-number-format-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      })
  }

  private setUpCollapsible(): void {
    new Setting(this.containerEl)
      .setName('Make Verses Collapsible')
      .setDesc('Make the rendered verses collapsible')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.collapsibleVerses)
          .onChange(async (value) => {
            this.plugin.settings.collapsibleVerses = value
            await this.plugin.saveSettings()
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `collapsible-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      )
  }

  private setUpExpertSettings(): void {
    new Setting(this.containerEl)
      .setName('Expert Settings')
      .setDesc('Display or Hide Expert Settings, such as Tagging and Linking settings')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.advancedSettings)
          .onChange(async (value) => {
            this.plugin.settings.advancedSettings = value
            await this.plugin.saveSettings()
            pluginEvent.trigger('bible-reference:settings:advanced', [value])
            // todo add event log stats fire
          })
      )
  }

  private setUpBookTagging(): void {
    this.expertSettingContainer && new Setting(this.expertSettingContainer)
      .setName('Add a Book Tag')
      .setDesc('Add a hidden book tag at bottom, for example #John')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.bookTagging)
          .onChange(async (value) => {
            this.plugin.settings.bookTagging = value
            await this.plugin.saveSettings()
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `book-tagging-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      )
  }

  private setUpChapterTagging(): void {
    this.expertSettingContainer && new Setting(this.expertSettingContainer)
      .setName('Add a Chapter Tag')
      .setDesc('Add a hidden chapter tag at bottom, for example #John1')
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.chapterTagging)
          .onChange(async (value) => {
            this.plugin.settings.chapterTagging = value
            await this.plugin.saveSettings()
            EventStats.logSettingChange(
              'changeVerseFormatting',
              {key: `chapter-tagging-${value}`, value: 1},
              this.plugin.settings.optOutToEvents
            )
          })
      )
  }

  private setUpOptOutEventsOptions(): void {
    new Setting(this.containerEl)
      .setName('Opt Out of Events Logging')
      .setDesc(
        'We used events logging to improve the plugin, this is very helpful for us, but if you want to opt out, you can do it here. (Excluding Errors Logs))'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.optOutToEvents)
          .onChange(async (value) => {
            EventStats.logSettingChange(
              'others',
              {key: `opt-${value ? 'out' : 'in'}`, value: 1},
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
}
