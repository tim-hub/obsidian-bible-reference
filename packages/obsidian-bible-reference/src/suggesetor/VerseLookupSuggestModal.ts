import { MarkdownView, SuggestModal } from 'obsidian'
import {
  verseMatch,
  hasExplicitVerse,
  isIncompleteReference,
} from '../utils/verseMatch'
import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import BibleReferencePlugin from '../main'

export class VerseLookupSuggestModal extends SuggestModal<VerseSuggesting> {
  settings: BibleReferencePluginSettings

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings,
    private forceLinkOnly = false
  ) {
    super(plugin.app)
    this.settings = settings
    this.setInstructions([
      {
        command: '',
        purpose: forceLinkOnly
          ? 'Select a reference to insert as a link, ex: John1:1-3  ·  John1:a for a whole chapter'
          : 'Select verses to insert, ex: John1:1-3  ·  John1:a for a whole chapter',
      },
    ])
  }

  private get isLinkOnly(): boolean {
    return this.forceLinkOnly || !!this.settings?.linkOnlyMode
  }

  public onOpen() {
    super.onOpen()
  }

  async getSuggestions(query: string): Promise<VerseSuggesting[]> {
    const match = verseMatch(query)
    if (!hasExplicitVerse(query) || isIncompleteReference(query)) {
      return []
    }
    if (match) {
      console.debug('trigger on', query)
      return getSuggestionsFromQuery(
        `${query}`,
        this.settings,
        undefined,
        this.isLinkOnly
      )
    }
    return []
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement) {
    suggestion.renderSuggestion(el, this.isLinkOnly)
  }

  onChooseSuggestion(item: VerseSuggesting, evt: MouseEvent | KeyboardEvent) {
    const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor
    if (!editor) {
      return
    }
    editor.replaceRange(
      this.isLinkOnly ? item.linkOnlyContent : item.allFormattedContent,
      editor.getCursor()
    )
  }
}
