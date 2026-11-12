import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  Notice,
  TFile,
} from 'obsidian'
import BibleReferencePlugin from '../main'
import {
  verseMatch,
  matchTriggerPrefix,
  isIncompleteReference,
} from '../utils/verseMatch'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { BibleReferencePluginSettings } from '../data/constants'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'
import { versionSelectionMatch } from '../utils/versionSelectionMatch'
import { getBibleVersion } from '../data/BibleVersionCollection'
import {
  isTranslationAllowed,
  offlineModeBlockedMessage,
} from '../utils/offlineMode'
import { debounceLookup } from '../utils/debounceLookup'

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseEditorSuggester extends EditorSuggest<VerseSuggesting> {
  plugin: BibleReferencePlugin
  settings: BibleReferencePluginSettings
  private lastBlockedTranslation = ''
  // Only the reference the user stops typing on is fetched: a bare chapter is
  // a valid lookup, so "Ps 119" would otherwise fetch Ps 1 and Ps 11 first.
  private lookup = debounceLookup(
    ({ bookVerse, translation }: { bookVerse: string; translation: string }) =>
      getSuggestionsFromQuery(
        bookVerse,
        this.settings,
        translation,
        this.isLinkOnly
      )
  )

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
    this.plugin = plugin
    this.settings = settings
  }

  private get isLinkOnly(): boolean {
    return !!this.settings?.linkOnlyMode
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
    let versionSelectionMatchResult = versionSelectionMatch(translationQuery)

    if (verseMatchResult && verseMatchResult.length > 0) {
      if (
        versionSelectionMatchResult &&
        getBibleVersion(versionSelectionMatchResult).key ==
          versionSelectionMatchResult
      ) {
        if (
          isTranslationAllowed(
            this.plugin.settings,
            versionSelectionMatchResult
          )
        ) {
          console.log(`set version : ${versionSelectionMatchResult}`)
          this.plugin.settings.bibleVersion = versionSelectionMatchResult // pick a version
          this.plugin.saveSettings() //todo this is an async function, so it may not be saved before the getSuggestions is called
        } else {
          // Offline Mode: keep the current (bundled) version. onTrigger runs on
          // every keystroke, so tell the user only once per blocked version.
          if (this.lastBlockedTranslation !== versionSelectionMatchResult) {
            this.lastBlockedTranslation = versionSelectionMatchResult
            new Notice(offlineModeBlockedMessage(versionSelectionMatchResult))
          }
          versionSelectionMatchResult = ''
        }
      }
      // When a version IS specified in the query, update the plugin's bibleVersion setting
      // so that version persists across subsequent lookups (including those from the
      // quick-translation hotkey). When no version is specified, the fallback to
      // settings.bibleVersion happens in getSuggestionsFromQuery.

      // A bare chapter ("Ps 2") is a whole-chapter lookup and a trailing dash
      // ("Ps 2,4-") an open-ended range, so both trigger. Only a dangling
      // separator like "John 3:" or "John 3:16," waits for more input.
      if (isIncompleteReference(bookVerseQuery)) {
        return null
      }

      console.debug('trigger on', queryContent)
      return {
        end: cursor,
        start: {
          line: cursor.line,
          // The trigger prefix is checked against the first two characters of
          // the line, so it always sits at column 0 and the whole span up to
          // the cursor is ours to replace. Deriving this from the match's index
          // inside queryContent instead was off by the prefix length whenever
          // the match did not start at the very beginning ("--i am reading
          // Genesis 1:1" left a stray "-" behind).
          ch: 0,
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

    return this.lookup({
      bookVerse: bookVerseQuery,
      translation: translationQuery,
    })
  }

  close(): void {
    this.lookup.cancel()
    super.close()
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement): void {
    suggestion.renderSuggestion(el, this.isLinkOnly)
  }

  selectSuggestion(suggestion: VerseSuggesting): void {
    if (this.context) {
      this.context.editor.replaceRange(
        this.isLinkOnly
          ? suggestion.linkOnlyContent
          : suggestion.allFormattedContent,
        this.context.start,
        this.context.end
      )
    }
  }
}
