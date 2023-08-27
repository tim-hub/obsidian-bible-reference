import { App, MarkdownView, SuggestModal } from 'obsidian'
import { verseMatch } from '../utils/verseMatch'
import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import BibleReferencePlugin from '../main';

export class VerseLookupSuggestModal extends SuggestModal<VerseSuggesting> {
  settings: BibleReferencePluginSettings

  constructor(plugin: BibleReferencePlugin, settings: BibleReferencePluginSettings) {
    super(plugin.app)
    this.settings = settings
    this.setInstructions([
      { command: '', purpose: 'Select verses to insert, ex: John1:1-3' },
    ])
  }

  async getSuggestions(query: string): Promise<VerseSuggesting[]> {
    const match = verseMatch(query, true)
    if (match) {
      console.debug('trigger on', query)
      return getSuggestionsFromQuery(`--${query}`, this.settings)
    }
    return []
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement) {
    suggestion.renderSuggestion(el)
  }

  onChooseSuggestion(item: VerseSuggesting, evt: MouseEvent | KeyboardEvent) {
    const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
    if (!editor) {
      return
    }
    editor.replaceRange(item.allFormatedContent, editor.getCursor())
  }
}
