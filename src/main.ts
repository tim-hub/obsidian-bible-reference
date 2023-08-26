import { Plugin } from 'obsidian'
import {
  APP_NAMING,
  BibleReferencePluginSettings,
  DEFAULT_SETTINGS,
} from './data/constants'
import { BibleReferenceSettingTab } from './ui/BibleReferenceSettingTab'
import { VerseEditorSuggester } from './suggesetor/VerseEditorSuggester'
import { VerseLookupSuggestModal } from './ui/VerseLookupSuggestModal'

export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings
  suggestModal: VerseLookupSuggestModal

  async onload() {
    console.log('loading plugin -', APP_NAMING.appName)

    await this.loadSettings()
    this.suggestModal = new VerseLookupSuggestModal(this.app, this.settings)
    this.addSettingTab(new BibleReferenceSettingTab(this.app, this))
    this.registerEditorSuggest(new VerseEditorSuggester(this, this.settings))
    this.addCommand({
      id: 'obr-lookup',
      name: 'Verse Lookup',
      callback: () => {
        this.suggestModal.open()
      },
    })
  }

  onunload() {
    console.log('unloading plugin', APP_NAMING.appName)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    console.debug(this.settings)
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
