import { App, MarkdownView, SuggestModal } from 'obsidian'
import { verseMatch } from '../utils/verseMatch'
import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import BibleReferencePlugin from '../main'
import { EventStats } from '../provider/EventStats';


export class VerseLookupSuggestModal extends SuggestModal<VerseSuggesting> {
  settings: BibleReferencePluginSettings

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
    this.settings = settings
    this.setInstructions([
      {command: '', purpose: 'Select verses to insert, ex: John1:1-3'},
    ])
  }

  public onOpen() {
    super.onOpen();
  }

  async getSuggestions(query: string): Promise<VerseSuggesting[]> {
    const match = verseMatch(query, true)
    if (match) {
      console.debug('trigger on', query)
      EventStats.logLookup('verseLookUp', {key: `${this.settings.bibleVersion}-${match}`, value: 1})
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
    editor.replaceRange(item.allFormattedContent, editor.getCursor())
  }
}
