import { App, DropdownComponent, Notice, PluginSettingTab, Setting } from 'obsidian'
import BibleReferencePlugin from './../main'
import { allBibleVersionsWithLanguageNameAlphabetically, DEFAULT_BIBLE_VERSION } from '../data/BibleVersionCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import {
  BibleVerseReferenceLinkPosition,
  BibleVerseReferenceLinkPositionCollection,
} from '../data/BibleVerseReferenceLinkPosition'
import { BibleVerseFormat, BibleVerseFormatCollection } from '../data/BibleVerseFormat'
import { BibleVerseNumberFormat, BibleVerseNumberFormatCollection } from '../data/BibleVerseNumberFormat'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { EventStats } from '../provider/EventStats'
import { APP_NAMING, BibleVersionNameLengthEnum, OutgoingLinkPositionEnum } from '../data/constants'
import { pluginEvent } from '../obsidian/PluginEvent'

export class BibleReferenceSettingTab extends PluginSettingTab {
  private plugin: BibleReferencePlugin
  private expertSettingContainer?: HTMLElement

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  public async display(): Promise<void> {
    this.containerEl.empty()
    this.startListeningToEvents()
    const headingSection = this.containerEl.createDiv()
    headingSection.innerHTML = `
        <iframe src="https://github.com/sponsors/tim-hub/button" title="Sponsor Obsidian Bible Reference" width="116" height="32px" class="sponsor-button"/>
    `

    this.containerEl.createEl('h1', { text: APP_NAMING.appName })
    this.setUpVersionSettingsAndVersionOptions()

    this.containerEl.createEl('h2', { text: 'Verses Rendering' })
    this.setUpReferenceLinkPositionOptions()
    // 2 options for reference
    this.setUpShowVerseTranslationOptions()
    this.setUpHyperlinkingOptions()

    this.setUpVerseFormatOptions()
    this.setUpVerseNumberFormatOptions()
    this.setUpBibleIconPrefixToggle()
    this.setUpCollapsibleToggle()
    this.setUpStatusIndicationOptions()
    this.containerEl.createEl('h2', { text: 'Others' })
    this.setUpExpertSettings()

    this.containerEl.createSpan({}, (span) => {
      span.innerHTML = `

<a href="https://github.com/tim-hub/obsidian-bible-reference">Github Repo</a> |
<a href="https://github.com/tim-hub/obsidian-bible-reference/blob/master/docs/privacy.md">Privacy Policy</a> |
<a href="https://github.com/sponsors/tim-hub">Support Us</a>

<br/>
<br/>

<span class="setting-item-description">
Obsidian Bible Reference  is proudly powered by
    <a href="https://antioch.tech/obsidian-bible-reference/">
        <img src="https://antioch.tech/wp-content/uploads/2023/10/logo_128.png" alt="Antioch Tech logo" class="logo"> Antioch Tech
    </a>
</span>

    `
    })

    // this initialization order is important
    this.expertSettingContainer = this.containerEl.createDiv()
    if (this.plugin.settings.advancedSettings) {
      this.displayExpertSettings()
    }
    EventStats.logUIOpen(
      'settingsOpen',
      { key: 'open', value: 1 },
      this.plugin.settings.optOutToEvents,
    )
  }

  private startListeningToEvents(): void {
    pluginEvent.on('bible-reference:settings:advanced', (value: boolean) => {
      console.log('advanced', value)
      if (this.plugin.settings.advancedSettings) {
        this.displayExpertSettings()
      } else {
        this?.expertSettingContainer && this.expertSettingContainer.empty()
      }
    })

    pluginEvent.on('bible-reference:settings:re-render', (value: boolean) => {
      console.log('re-render', value)
      this.display()
    })
  }

  private displayExpertSettings(): void {
    if (this.expertSettingContainer) {
      this.expertSettingContainer.empty()
      this.expertSettingContainer.createEl('h2', { text: 'Expert Settings' })

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
                { key: `book-tagging-${value}`, value: 1 },
                this.plugin.settings.optOutToEvents,
              )
            }),
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
                { key: `chapter-tagging-${value}`, value: 1 },
                this.plugin.settings.optOutToEvents,
              )
            }),
        )

      const getOutgoingLinkPosition = (
        linkingPostion: string | OutgoingLinkPositionEnum | undefined,
      ) => {
        let value = linkingPostion
        if (!value) {
          value = OutgoingLinkPositionEnum.None
        } else if ((value as any) === true) {
          value = OutgoingLinkPositionEnum.Header
        }
        // otherwise no change
        return value as string
      }

      new Setting(this.expertSettingContainer)
        .setName('Add a Book Outgoing Link')
        .setDesc('Makes an outgoing link for the book, for example [[John]]')
        .addDropdown((dropdown) => {
          Object.keys(OutgoingLinkPositionEnum).forEach((name) => {
            dropdown.addOption(name, name)
          })
          const value = getOutgoingLinkPosition(
            this.plugin.settings?.bookBacklinking,
          )
          dropdown.setValue(value)
          dropdown.onChange(async (value) => {
            this.plugin.settings.bookBacklinking =
              value as OutgoingLinkPositionEnum
            await this.plugin.saveSettings()
          })
        })

      new Setting(this.expertSettingContainer)
        .setName('Add a Chapter Outgoing Links')
        .setDesc(
          'Makes an outgoing link for the chapter, for example [[John1]] ',
        )
        .addDropdown((dropdown) => {
          Object.keys(OutgoingLinkPositionEnum).forEach((name) => {
            dropdown.addOption(name, name)
          })
          const value = getOutgoingLinkPosition(
            this.plugin.settings?.chapterBacklinking,
          )
          dropdown.setValue(value)
          dropdown.onChange(async (value) => {
            this.plugin.settings.chapterBacklinking =
              value as OutgoingLinkPositionEnum
            await this.plugin.saveSettings()
          })
        })

      this.setUpOptOutEventsOptions(this.expertSettingContainer)
    }
  }

  private setUpVersionSettingsAndVersionOptions(): void {
    let allAvailableVersionOptions =
      allBibleVersionsWithLanguageNameAlphabetically
    const disableBibleAPI = false
    if (disableBibleAPI) {
      allAvailableVersionOptions = allAvailableVersionOptions.filter((v) => {
        return v.apiSource.name !== BibleAPISourceCollection.bibleApi.name
      })
    }
    if (
      disableBibleAPI &&
      !allAvailableVersionOptions.find(
        (v) => v.key === this.plugin.settings.bibleVersion,
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
            `${version.language} - ${version.versionName} @${version.apiSource.name}`,
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
              { key: value, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          })
      })
  }

  private setUpStatusIndicationOptions(): void {
    new Setting(this.containerEl)
      .setName('Display Selected Version at Status Bar')
      .setDesc('The way of display the selected Bible Version at status bar')
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption(
          BibleVersionNameLengthEnum.Full,
          BibleVersionNameLengthEnum.Full,
        )
        dropdown.addOption(
          BibleVersionNameLengthEnum.Short,
          BibleVersionNameLengthEnum.Short,
        )
        dropdown.addOption(
          BibleVersionNameLengthEnum.Hide,
          BibleVersionNameLengthEnum.Hide,
        )
        dropdown
          .setValue(
            this.plugin.settings.bibleVersionStatusIndicator ??
            BibleVersionNameLengthEnum.Short,
          )
          .onChange(async (value) => {
            this.plugin.settings.bibleVersionStatusIndicator =
              value as BibleVersionNameLengthEnum
            await this.plugin.saveSettings()
            // re-fire the bible version, so that the indicator will reflect the change
            pluginEvent.trigger('bible-reference:settings:version', [
              this.plugin.settings.bibleVersion,
            ])
            EventStats.logSettingChange(
              'others',
              { key: `version-status-indicator-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          })
      })
  }

  private setUpReferenceLinkPositionOptions(): void {
    new Setting(this.containerEl)
      .setName('Verse Reference Position')
      .setDesc('Where to put the reference link of the Bible')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseReferenceLinkPositionCollection.forEach(
          ({ name, description }) => {
            dropdown.addOption(name, description)
          },
        )
        dropdown
          .setValue(
            this.plugin.settings.referenceLinkPosition ??
            BibleVerseReferenceLinkPosition.None,
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
              this.plugin.settings.optOutToEvents,
            )
          })
      })
  }

  private setUpVerseFormatOptions(): void {
    new Setting(this.containerEl)
      .setName('Verse Formatting Options')
      .setDesc(
        'Sets how to format the verses in Obsidian, either line by line or in 1 paragraph',
      )
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseFormatCollection.forEach(({ name, description }) => {
          dropdown.addOption(name, description)
        })
        dropdown
          .setValue(
            this.plugin.settings.verseFormatting ?? BibleVerseFormat.SingleLine,
          )
          .onChange(async (value) => {
            this.plugin.settings.verseFormatting = value as BibleVerseFormat
            console.debug('Bible Verse Format To: ' + value)
            await this.plugin.saveSettings()
            new Notice('Bible Verse Format Settings Updated')
            EventStats.logSettingChange(
              'changeVerseFormatting',
              { key: `verse-format-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          })
      })
  }

  private setUpShowVerseTranslationOptions(): void {
    const setting = new Setting(this.containerEl)
      .setName('Show Verse Translation')
      .setDesc('Show or hide the verse translation in verses reference')
    setting.setTooltip(
      'This will show the verse translation verse text after the verse number',
    )
    setting.addToggle((toggle) => {
      toggle
        .setValue(!!this.plugin.settings?.showVerseTranslation)
        .onChange(async (value) => {
          this.plugin.settings.showVerseTranslation = value
          await this.plugin.saveSettings()
          EventStats.logSettingChange(
            'changeVerseFormatting',
            { key: `show-translation-${value}`, value: 1 },
            this.plugin.settings.optOutToEvents,
          )
        })
    })
  }

  private setUpHyperlinkingOptions(): void {
    const setting = new Setting(this.containerEl)
      .setName('Enable Hyperlinking')
      .setDesc('Enable or disable hyperlinking in verses reference')
    setting.setTooltip(
      'This will make the verse number clickable and will open the verse in the Bible app',
    )
    setting.addToggle((toggle) => {
      toggle
        .setValue(!!this.plugin.settings?.enableHyperlinking)
        .onChange(async (value) => {
          this.plugin.settings.enableHyperlinking = value
          await this.plugin.saveSettings()
          EventStats.logSettingChange(
            'changeVerseFormatting',
            { key: `hyperlinking-${value}`, value: 1 },
            this.plugin.settings.optOutToEvents,
          )
        })
    })
  }

  private setUpVerseNumberFormatOptions(): void {
    new Setting(this.containerEl)
      .setName('Verse Number Formatting Options')
      .setDesc('Sets how to format the verse numbers in Obsidian')
      .addDropdown((dropdown: DropdownComponent) => {
        BibleVerseNumberFormatCollection.forEach(({ name, description }) => {
          dropdown.addOption(name, description)
        })
        dropdown
          .setValue(
            this.plugin.settings.verseNumberFormatting ??
            BibleVerseNumberFormat.Period,
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
              this.plugin.settings.optOutToEvents,
            )
          })
      })
  }

  private setUpCollapsibleToggle(): void {
    const setting = new Setting(this.containerEl)
      .setName('Make Verses Collapsible *')
      .setDesc(
        'Make the rendered verses collapsible, (This option will be disabled if Bible Icon Prefix option above is disabled)',
      )
    setting.setTooltip(
      'This will make the rendered verses collapsible, so that you can hide them when you don\'t need them',
    )
    setting.addToggle((toggle) => {
      if (!this.plugin.settings?.displayBibleIconPrefixAtHeader) {
        toggle.setDisabled(true)
        toggle.setTooltip('')
      }
      toggle
        .setValue(!!this.plugin.settings?.collapsibleVerses)
        .onChange(async (value) => {
          this.plugin.settings.collapsibleVerses = value
          await this.plugin.saveSettings()
          EventStats.logSettingChange(
            'changeVerseFormatting',
            { key: `collapsible-${value}`, value: 1 },
            this.plugin.settings.optOutToEvents,
          )
        })
    })
  }

  private setUpBibleIconPrefixToggle(): void {
    new Setting(this.containerEl)
      .setName('Show Bible Icon Prefix "[!Bible]" *')
      .setDesc(
        'When this is true, it will render a Bible icon in Obsidian, disable this if you want to hide it or use standard Markdown. (This will disable the Collapsible option below)',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.displayBibleIconPrefixAtHeader)
          .onChange(async (value) => {
            this.plugin.settings.displayBibleIconPrefixAtHeader = value
            await this.plugin.saveSettings()
            if (!value) {
              this.plugin.settings.collapsibleVerses = false
              await this.plugin.saveSettings()
            }
            pluginEvent.trigger('bible-reference:settings:re-render', [])
            EventStats.logSettingChange(
              'others',
              { key: `displayBibleIconPrefix-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          }),
      )
  }

  private setUpExpertSettings(): void {
    new Setting(this.containerEl)
      .setName('Expert Settings')
      .setDesc(
        'Display or Hide Expert Settings, such as Tagging, Linking, Events Logging settings',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.advancedSettings)
          .onChange(async (value) => {
            this.plugin.settings.advancedSettings = value
            await this.plugin.saveSettings()
            pluginEvent.trigger('bible-reference:settings:advanced', [value])
            // todo add event log stats fire
          }),
      )
  }

  private setUpBookTagging(): void {
    this.expertSettingContainer &&
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
              { key: `book-tagging-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          }),
      )
  }

  private setUpChapterTagging(): void {
    this.expertSettingContainer &&
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
              { key: `chapter-tagging-${value}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
          }),
      )
  }

  private setUpOptOutEventsOptions(
    container: HTMLElement = this.containerEl,
  ): void {
    new Setting(container)
      .setName('Opt Out of Events Logging')
      .setDesc(
        'We used events logging to improve the plugin, this is very helpful for us, but if you want to opt out, you can do it here. (Excluding Errors Logs))',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(!!this.plugin.settings?.optOutToEvents)
          .onChange(async (value) => {
            EventStats.logSettingChange(
              'others',
              { key: `opt-${value ? 'out' : 'in'}`, value: 1 },
              this.plugin.settings.optOutToEvents,
            )
            this.plugin.settings.optOutToEvents = value
            await this.plugin.saveSettings()
            if (value) {
              new Notice(
                'You have opted out of events logging, we will not log any events from now on',
              )
            } else {
              new Notice(
                'Thanks for opting in to events logging, this is really valuable for us to improve the plugin',
              )
            }
          }),
      )
  }
}
