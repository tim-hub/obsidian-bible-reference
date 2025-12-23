import { App, SuggestModal } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { allBibleVersionsWithLanguageNameAlphabetically } from '../data/BibleVersionCollection'
import BibleReferencePlugin from '../main'

export class TranslationSwitcherModal extends SuggestModal<IBibleVersion> {
  private plugin: BibleReferencePlugin

  constructor(app: App, plugin: BibleReferencePlugin) {
    super(app)
    this.plugin = plugin
    this.setPlaceholder('Search Bible translations...')
    this.setInstructions([
      { command: '', purpose: 'Select a translation to switch to' },
    ])
  }

  getSuggestions(query: string): IBibleVersion[] {
    const lowerQuery = query.toLowerCase()
    if (!lowerQuery) {
      return allBibleVersionsWithLanguageNameAlphabetically
    }
    return allBibleVersionsWithLanguageNameAlphabetically.filter(
      (v) =>
        v.key.toLowerCase().includes(lowerQuery) ||
        v.versionName.toLowerCase().includes(lowerQuery) ||
        v.language.toLowerCase().includes(lowerQuery)
    )
  }

  renderSuggestion(version: IBibleVersion, el: HTMLElement): void {
    el.createDiv({
      text: `${version.language} - (${version.key.toUpperCase()}) - ${version.versionName}`,
    })
  }

  onChooseSuggestion(version: IBibleVersion): void {
    this.plugin.switchToTranslation(version.key)
  }
}
