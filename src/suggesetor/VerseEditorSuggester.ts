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
import { EventStats } from '../provider/EventStats'
import { versionMatch } from '../utils/versionMatch'
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
    const queryContent = currentContent.substring(2)

    const match = verseMatch(queryContent)
    
    if (match) {

      const vMatch = versionMatch(queryContent)
      if (vMatch) {
        this.plugin.settings.bibleVersion = vMatch
        if (getBibleVersion(vMatch).key == vMatch) {
          this.plugin.saveSettings()
        }
      } else {
        if (this.settings.bibleVersion != this.settings.defaultBibleVersion) {
          this.settings.bibleVersion = this.settings.defaultBibleVersion
          console.log(`defaultBibleVersion : ${this.settings.defaultBibleVersion}`)
          this.plugin.saveSettings()
        }
      }

      console.debug('trigger on', queryContent)
      EventStats.logUIOpen(
        'lookupEditorOpen',
        { key: `${this.settings.bibleVersion}`, value: 1 },
        this.settings.optOutToEvents
      )
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: queryContent.lastIndexOf(match),
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
    console.log(`context query : ${context.query}`)
    const suggestions = await getSuggestionsFromQuery(
      context.query,
      this.settings
    )
    EventStats.logLookup(
      'verseLookUp',
      {
        key: `${this.settings.bibleVersion}-${context.query.toLowerCase()}`,
        value: 1,
      },
      this.settings.optOutToEvents
    )
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
        this.context.end,
      )
    }
  }
}
