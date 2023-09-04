import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian'
import BibleReferencePlugin from '../main'
import { verseMatch } from '../utils/verseMatch'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import {
  API_WAITING_LABEL,
  BibleReferencePluginSettings,
} from '../data/constants'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import { EventStats } from '../provider/EventStats';

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseEditorSuggester extends EditorSuggest<VerseSuggesting> {
  plugin: BibleReferencePlugin
  settings: BibleReferencePluginSettings

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
    this.plugin = plugin
    this.settings = settings
  }

  /**
   * This will build the EditorSuggestContext in getSuggestions
   * @param cursor
   * @param editor
   * @param _
   */
  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile
  ): EditorSuggestTriggerInfo | null {
    // @ts-ignore
    const suggestEl = this.suggestEl as HTMLDivElement
    suggestEl.createDiv({ cls: 'obr-loading-container' }).hide()

    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch)

    const match = verseMatch(currentContent, false)
    if (match) {
      console.debug('trigger on', currentContent)
      EventStats.logUIOpen('lookupEditorOpen', {key: `${this.settings.bibleVersion}-match`, value: 1})
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf(match),
        },
        query: match,
      }
    }
    return null
  }

  /**
   * Suggest bible verses.
   * @param context
   */
  async getSuggestions(
    context: EditorSuggestContext
  ): Promise<VerseSuggesting[]> {
    // todo these 2 el could be managed better, move to renderSuggestion
    // @ts-ignore
    const suggestEl = this.suggestEl as HTMLDivElement
    // @ts-ignore
    const suggestionsEl = (this.suggestions as any)
      .containerEl as HTMLDivElement
    suggestionsEl.hide()

    const loadingContainer = suggestEl.getElementsByClassName(
      'obr-loading-container'
    )[0] as HTMLDivElement
    loadingContainer.setText(API_WAITING_LABEL)
    loadingContainer.show()

    const suggestions = await getSuggestionsFromQuery(
      context.query,
      this.settings
    )
    // hide loading and how suggestions todo move to render
    loadingContainer.hide()
    suggestionsEl.show()
    EventStats.logLookup('verseLookUp', {key: `${this.settings.bibleVersion}-${context.query}`, value: 1})
    return suggestions
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement): void {
    suggestion.renderSuggestion(el)
  }

  selectSuggestion(suggestion: VerseSuggesting): void {
    if (this.context) {
      /* prettier-ignore */
      (this.context.editor as Editor).replaceRange(
        suggestion.allFormattedContent,
        this.context.start,
        this.context.end
      )
    }
  }
}
