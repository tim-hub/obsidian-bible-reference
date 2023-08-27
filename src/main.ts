import { Plugin } from 'obsidian'
import {
  APP_NAMING,
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from './data/constants'
import { BibleReferenceSettingTab } from './ui/BibleReferenceSettingTab'
import { VerseEditorSuggester } from './suggesetor/VerseEditorSuggester'
import { VerseLookupSuggestModal } from './suggesetor/VerseLookupSuggestModal'
import { VerseOfDayEditorSuggester } from './suggesetor/VerseOfDayEditorSuggester';

export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings
  verseLookUpModal: VerseLookupSuggestModal

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName)

    await this.loadSettings()
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this))

    this.registerEditorSuggest(new VerseOfDayEditorSuggester(this, this.settings))
    this.registerEditorSuggest(new VerseEditorSuggester(this, this.settings))

    this.verseLookUpModal = new VerseLookupSuggestModal(this.app, this.settings)
    this.addCommand({
      id: 'obr-lookup',
      name: 'Verse Lookup',
      callback: () => {
        this.verseLookUpModal.open()
      },
    })
  }

  onunload() {
    console.log('unloading plugin', APP_NAMING.appName)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    console.debug('settings got loaded')
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
