import { App, MarkdownView, SuggestModal } from 'obsidian'
import { verseMatch } from '../utils/verseMatch'
import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../VerseSuggesting'
import { getSuggestionsFromQuery } from '../suggesetor/getSuggestionsFromQuery'

export class VerseLookupSuggestModal extends SuggestModal<VerseSuggesting> {
  settings: BibleReferencePluginSettings

  constructor(app: App, settings: BibleReferencePluginSettings) {
    super(app)
    this.settings = settings
    this.setInstructions([
      { command: '', purpose: 'Select verses to insert, ex: John1:1-3' },
    ])
  }

  async getSuggestions(query: string): Promise<VerseSuggesting[]> {
    const match = verseMatch(query, true)
    if (match) {
      console.debug('trigger on', query)
      // getSuggestionsFromQuery expects '--Book#:# form'
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
    editor.replaceRange(item.versesContent, editor.getCursor())
  }
}
