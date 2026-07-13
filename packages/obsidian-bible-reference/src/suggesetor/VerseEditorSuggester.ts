import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian'
import BibleReferencePlugin from '../main'
import { verseMatch, matchTriggerPrefix } from '../utils/verseMatch'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { BibleReferencePluginSettings } from '../data/constants'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import { versionSelectionMatch } from '../utils/versionSelectionMatch'
import { getBibleVersion } from '../data/BibleVersionCollection'

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

  private getBookVerseAndTranslation(queryContent: string) {
    let bookVerseQuery = queryContent
    let translationQuery = ''
    // split by @
    if (queryContent.includes('@')) {
      const queryContentSplit = queryContent.split('@')
      bookVerseQuery = queryContentSplit[0]
      translationQuery = queryContentSplit[1]
    }
    return { bookVerseQuery, translationQuery }
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
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch)

    // get first 2 characters
    if (currentContent.length < 2) {
      return null
    }
    const prefixTrigger = currentContent.substring(0, 2)
    if (!matchTriggerPrefix(prefixTrigger)) {
      return null
    }
    const queryContent = currentContent.substring(2) // remove the trigger prefix
    const { bookVerseQuery, translationQuery } =
      this.getBookVerseAndTranslation(queryContent)

    const verseMatchResult = verseMatch(bookVerseQuery)
    const versionSelectionMatchResult = versionSelectionMatch(translationQuery)

    if (verseMatchResult && verseMatchResult.length > 0) {
      if (
        versionSelectionMatchResult &&
        getBibleVersion(versionSelectionMatchResult).key ==
          versionSelectionMatchResult
      ) {
        console.log(`set version : ${versionSelectionMatchResult}`)
        this.plugin.settings.bibleVersion = versionSelectionMatchResult // pick a version
        this.plugin.saveSettings() //todo this is an async function, so it may not be saved before the getSuggestions is called
      }
      // When a version IS specified in the query, update the plugin's bibleVersion setting
      // so that version persists across subsequent lookups (including those from the
      // quick-translation hotkey). When no version is specified, the fallback to
      // settings.bibleVersion happens in getSuggestionsFromQuery.

      console.debug('trigger on', queryContent)
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: queryContent.lastIndexOf(verseMatchResult),
        },
        query: `${bookVerseQuery}@${versionSelectionMatchResult}`,
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
    const { bookVerseQuery, translationQuery } =
      this.getBookVerseAndTranslation(context.query)

    const suggestions = await getSuggestionsFromQuery(
      bookVerseQuery,
      this.settings,
      translationQuery
    )
    return suggestions
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement): void {
    suggestion.renderSuggestion(el)
  }

  selectSuggestion(suggestion: VerseSuggesting): void {
    if (this.context) {
      this.context.editor.replaceRange(
        suggestion.allFormattedContent,
        this.context.start,
        this.context.end
      )
    }
  }
}
