import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import {
  APP_NAMING,
  BibleReferencePluginSettings,
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
import getFlags from './provider/FeatureFlag'

export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings
  verseLookUpModal: VerseLookupSuggestModal
  verseOfDayModal: VerseOfDayModal
  private cachedVerseOfDaySuggesting: {
    verseOfDaySuggesting: VerseOfDaySuggesting
    ttl: number
    timestamp: number
  }
  private ribbonButton?: HTMLElement

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

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName)

    await this.loadSettings()
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this))
    this.registerEditorSuggest(new VerseEditorSuggester(this, this.settings))

    this.verseLookUpModal = new VerseLookupSuggestModal(this, this.settings)
    this.verseOfDayModal = new VerseOfDayModal(this, this.settings)

    const flags = await getFlags()
    console.debug(flags, flags.isFeatureEnabled('vod'))
    if (flags.isFeatureEnabled('vod')) {
      console.debug('vod feature flag enabled')
      this.registerEditorSuggest(
        new VerseOfDayEditorSuggester(this, this.settings)
      )

      this.addVerseLookupCommand()
      this.addVerseOfDayCommands()
      if (this.settings.enableBibleVerseLookupRibbon) {
        this.addRibbonButton()
      }
    }
  }

  onunload() {
    console.log('unloading plugin', APP_NAMING.appName)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    console.debug('settings is loaded')
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  private addVerseLookupCommand(): void {
    this.addCommand({
      id: 'obr-lookup',
      name: 'Verse Lookup',
      callback: () => {
        this.verseLookUpModal.open()
      },
    })
  }

  private addVerseOfDayCommands(): void {
    this.addCommand({
      id: 'obr-vod-view-verses-of-day',
      name: 'Verse Of The Day - Notice (10 Seconds)',
      callback: async () => {
        // this.verseOfDayModal.open()
        const verse = await this.getAndCachedVerseOfDay()
        new Notice(
          `${verse.verseTexts?.join('')} -- ${verse.verseReference.bookName} ${
            verse.verseReference.chapterNumber
          }:${verse.verseReference.verseNumber}`,
          1000 * 10
        )
      },
    })

    this.addCommand({
      id: 'obs-vod-insert-verse-of-day',
      name: 'Verse Of The Day - Insert To Current Note',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const vodSuggesting = await this.getAndCachedVerseOfDay()
        editor.replaceSelection(vodSuggesting.allFormatedContent)
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
        this.verseLookUpModal.open()
      }
    )
  }

  private removeRibbonButton(): void {
    if (this.ribbonButton) {
      this.ribbonButton.parentNode?.removeChild(this.ribbonButton)
    }
  }
}
