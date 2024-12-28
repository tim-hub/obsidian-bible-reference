import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import {
  APP_NAMING,
  BibleReferencePluginSettings,
  BibleVersionNameLengthEnum,
  DEFAULT_SETTINGS,
} from './data/constants'
import { BibleReferenceSettingTab } from './ui/BibleReferenceSettingTab'
import { VerseEditorSuggester } from './suggesetor/VerseEditorSuggester'
import { VerseLookupSuggestModal } from './suggesetor/VerseLookupSuggestModal'
import { VerseOfDayEditorSuggester } from './suggesetor/VerseOfDayEditorSuggester'
import { VerseOfDayModal } from './suggesetor/VerseOfDayModal'
import { getVod } from './provider/VODProvider'
import { splitBibleReference } from './utils/splitBibleReference'
import { VerseOfDaySuggesting } from './verse/VerseOfDaySuggesting'
import { FlagService } from './provider/FeatureFlag'
import { EventStats } from './provider/EventStats'
import { getBibleVersion } from './data/BibleVersionCollection'
import { pluginEvent } from './obsidian/PluginEvent'
import { BibleReferenceAPI } from './api/PluginAPI'

export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings
  verseLookUpModal: VerseLookupSuggestModal
  verseOfDayModal: VerseOfDayModal
  api: BibleReferenceAPI
  private cachedVerseOfDaySuggesting: {
    verseOfDaySuggesting: VerseOfDaySuggesting
    ttl: number
    timestamp: number
  }
  private ribbonButton?: HTMLElement
  private statusBarIndicator?: HTMLElement

  async onload() {
    console.debug('loading plugin -', APP_NAMING.appName)

    await this.loadSettings()
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this))
    this.registerEditorSuggest(new VerseEditorSuggester(this, this.settings))

    this.verseLookUpModal = new VerseLookupSuggestModal(this, this.settings)
    this.addVerseLookupCommand()
    this.addRibbonButton()

    this.api = new BibleReferenceAPI(this.app, this.settings)
    // Register the api globally
    // @ts-ignore
    ;(window['BibleReferenceAPI'] = this.api) &&
      this.register(() => {
        // @ts-ignore
        delete window['BibleReferenceAPI']
      })

    // enable vod
    this.registerEditorSuggest(
      new VerseOfDayEditorSuggester(this, this.settings)
    )
    this.verseOfDayModal = new VerseOfDayModal(this, this.settings)
    this.addVerseOfDayInsertCommand()
    this.addVerseOfDayNoticeCommand()

    // toggle bible icon prefix
    this.toggleBibleIconPrefix()

    this.initStatusBarIndicator()
    EventStats.logRecord(this.settings.optOutToEvents)
  }

  onunload() {
    console.debug('unloading plugin', APP_NAMING.appName)
    this.removeRibbonButton()
    this.tryRemoveStatusBarIndicator()
    pluginEvent.offAll() // so that we don't have to worry about off ref in multiple places
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    console.debug('settings is loaded')
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  private async getAndCachedVerseOfDay(): Promise<VerseOfDaySuggesting> {
    const { ttl, timestamp, verseOfDaySuggesting } =
      this?.cachedVerseOfDaySuggesting || {}
    if (!verseOfDaySuggesting || timestamp + ttl > Date.now()) {
      const vodResp = await getVod()
      const reference = splitBibleReference(vodResp.verse.details.reference)
      const verseTexts = [vodResp.verse.details.text]
      const vodSuggesting = new VerseOfDaySuggesting(
        this.settings,
        reference,
        verseTexts
      )
      this.cachedVerseOfDaySuggesting = {
        verseOfDaySuggesting: vodSuggesting,
        ttl: 1000 * 60 * 60 * 6,
        timestamp: Date.now(),
      }
    }
    return this.cachedVerseOfDaySuggesting.verseOfDaySuggesting
  }

  private addVerseLookupCommand(): void {
    this.addCommand({
      id: 'obr-lookup',
      name: 'Verse Lookup',
      callback: () => {
        EventStats.logUIOpen(
          'lookupModalOpen',
          { key: `command-lookup`, value: 1 },
          this.settings.optOutToEvents
        )
        this.verseLookUpModal.open()
      },
    })
  }

  private addVerseOfDayNoticeCommand(): void {
    this.addCommand({
      id: 'obr-vod-view-verses-of-day',
      name: 'Verse Of The Day - Notice (10 Seconds)',
      callback: async () => {
        // this.verseOfDayModal.open()
        const verse = await this.getAndCachedVerseOfDay()
        EventStats.logUIOpen(
          'vodEditorOpen',
          { key: `command-vod`, value: 1 },
          this.settings.optOutToEvents
        )
        new Notice(
          `${verse.verseTexts?.join('')} -- ${verse.verseReference.bookName} ${
            verse.verseReference.chapterNumber
          }:${verse.verseReference.verseNumber}`,
          1000 * 10
        )
      },
    })
  }

  private addVerseOfDayInsertCommand(): void {
    this.addCommand({
      id: 'obs-vod-insert-verse-of-day',
      name: 'Verse Of The Day - Insert To Current Note',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const vodSuggesting = await this.getAndCachedVerseOfDay()
        EventStats.logUIOpen(
          'vodEditorOpen',
          { key: `command-vod-insert`, value: 1 },
          this.settings.optOutToEvents
        )
        editor.replaceSelection(vodSuggesting.allFormattedContent)
      },
    })
  }

  // create a hotkey that will toggle the "Show Bible Icon Prefix" setting called: "setUpBibleIconPrefixToggle" from the BibleReferenceSettingTab class

  private toggleBibleIconPrefix() {
    this.addCommand({
      id: 'toggle-bible-icon-prefix',
      name: 'Toggle Bible Icon Prefix',
      callback: () => {
        this.settings.displayBibleIconPrefixAtHeader = !this.settings.displayBibleIconPrefixAtHeader
        this.saveSettings()
      },
    })
  }

  private addRibbonButton(): void {
    // https://lucide.dev/icons/?search=book
    // Obsidian use Lucide Icons
    this.ribbonButton = this.addRibbonIcon(
      'book-open',
      'Bible Verse Lookup',
      (_evt) => {
        EventStats.logUIOpen(
          'lookupModalOpen',
          { key: `ribbon-click`, value: 1 },
          this.settings.optOutToEvents
        )
        this.verseLookUpModal.open()
      }
    )
  }

  private removeRibbonButton(): void {
    if (this.ribbonButton) {
      EventStats.logUIOpen(
        'lookupModalOpen',
        { key: `ribbon-remove`, value: 1 },
        this.settings.optOutToEvents
      )
      this.ribbonButton.parentNode?.removeChild(this.ribbonButton)
    }
  }

  private getStatusBatLabel(): string {
    const selectedVersion = getBibleVersion(this.settings.bibleVersion)
    if (
      this.settings.bibleVersionStatusIndicator ===
      BibleVersionNameLengthEnum.Short
    ) {
      return `${selectedVersion.key.toUpperCase()}`
    } else if (
      this.settings.bibleVersionStatusIndicator ===
      BibleVersionNameLengthEnum.Full
    ) {
      return `${selectedVersion.versionName}(${selectedVersion.language})`
    } else {
      return ''
    }
  }

  /**
   * To indicate user the Bible version selected
   * @private
   */
  private initStatusBarIndicator(): void {
    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    this.tryRemoveStatusBarIndicator()
    this.statusBarIndicator = this.addStatusBarItem()
    // todo add an icon
    this.statusBarIndicator.createEl('span', {
      text: this.getStatusBatLabel(),
      cls: 'bible-version-indicator',
    })
    // create event listener for the update
    pluginEvent.on('bible-reference:settings:version', () => {
      this.updateStatusBarIndicator()
    })
    // this.registerEvent(versionChangeEventRef) // somehow this is not necessary
  }

  private tryRemoveStatusBarIndicator(): void {
    if (this.statusBarIndicator) {
      this.statusBarIndicator.parentNode?.removeChild(this.statusBarIndicator)
    }
  }

  private updateStatusBarIndicator(): void {
    if (
      this.statusBarIndicator &&
      'getElementsByClassName' in this.statusBarIndicator
    ) {
      const el = this.statusBarIndicator.getElementsByClassName(
        'bible-version-indicator'
      )[0]
      el.innerHTML = this.getStatusBatLabel()
    }
  }
}
