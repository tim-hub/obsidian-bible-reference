import { Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import { APP_NAMING, BibleReferencePluginSettings, DEFAULT_SETTINGS, } from './data/constants'
import { BibleReferenceSettingTab } from './ui/BibleReferenceSettingTab'
import { VerseEditorSuggester } from './suggesetor/VerseEditorSuggester'
import { VerseLookupSuggestModal } from './suggesetor/VerseLookupSuggestModal'
import { VerseOfDayEditorSuggester } from './suggesetor/VerseOfDayEditorSuggester'
import { VerseOfDayModal } from './suggesetor/VerseOfDayModal';
import { getVod } from './provider/VODProvider';
import { splitBibleReference } from './utils/splitBibleReference';
import { VerseOfDaySuggesting } from './verse/VerseOfDaySuggesting';

export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings
  verseLookUpModal: VerseLookupSuggestModal
  verseOfDayModal: VerseOfDayModal
  verseOfDaySuggesting: VerseOfDaySuggesting

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName)

    await this.loadSettings()
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this))

    this.registerEditorSuggest(
      new VerseOfDayEditorSuggester(this, this.settings)
    )
    this.registerEditorSuggest(new VerseEditorSuggester(this, this.settings))

    this.verseLookUpModal = new VerseLookupSuggestModal(this, this.settings)
    this.addCommand({
      id: 'obr-lookup',
      name: 'Verse Lookup',
      callback: () => {
        this.verseLookUpModal.open()
      },
    })

    this.verseOfDayModal = new VerseOfDayModal(this, this.settings)
    this.addCommand({
      id: 'obr-vod-verses-of-day',
      name: 'View Verse Of The Day',
      callback: async () => {
        // this.verseOfDayModal.open()
        // todo remove duplication
        if (!this.verseOfDaySuggesting) {

          const vodResp = await getVod()

          const reference = splitBibleReference(vodResp.verse.details.reference)
          const verseTexts = [vodResp.verse.details.text]

          const vodSuggesting = new VerseOfDaySuggesting(
            this.settings,
            reference,
            verseTexts
          )
          this.verseOfDaySuggesting = vodSuggesting
        }
        new Notice(`${this.verseOfDaySuggesting.verseTexts?.join('')} -- ${this.verseOfDaySuggesting.verseReference.bookName} ${this.verseOfDaySuggesting.verseReference.chapterNumber}:${this.verseOfDaySuggesting.verseReference.verseNumber}`)
      },
    })

    this.addCommand({
      id: 'obs-vod-insert-verse-of-day',
      name: 'Insert Verse Of The Day',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        // todo remove duplication
        if (this.verseOfDaySuggesting) {
          editor.replaceSelection(this.verseOfDaySuggesting.allFormatedContent);
          return
        }
        const vodResp = await getVod()

        const reference = splitBibleReference(vodResp.verse.details.reference)
        const verseTexts = [vodResp.verse.details.text]

        const vodSuggesting = new VerseOfDaySuggesting(
          this.settings,
          reference,
          verseTexts
        )
        this.verseOfDaySuggesting = vodSuggesting
        editor.replaceSelection(vodSuggesting.allFormatedContent);
      }
    });

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
}
