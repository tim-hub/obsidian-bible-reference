import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from 'obsidian'
import BibleReferencePlugin from '../main'
import { BibleReferencePluginSettings } from '../data/constants'
import { getVod } from '../provider/VODProvider'
import { VerseOfDaySuggesting } from '../verse/VerseOfDaySuggesting'
import { splitBibleReference } from '../utils/splitBibleReference'
import { matchTriggerPrefix } from '../utils/verseMatch'
import { EventStats } from '../provider/EventStats'

export class VerseOfDayEditorSuggester extends EditorSuggest<VerseOfDaySuggesting> {
  private plugin: BibleReferencePlugin
  private settings: BibleReferencePluginSettings

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
    this.plugin = plugin
    this.settings = settings
  }

  async getSuggestions(
    context: EditorSuggestContext
  ): Promise<VerseOfDaySuggesting[]> {
    const vodResp = await getVod()

    const reference = splitBibleReference(vodResp.verse.details.reference)
    const verseTexts = [vodResp.verse.details.text]

    const vodSuggesting = new VerseOfDaySuggesting(
      this.settings,
      reference,
      verseTexts
    )
    EventStats.logLookup(
      'vodLookUp',
      { key: `${this.settings.bibleVersion}-vod`, value: 1 },
      this.settings.optOutToEvents
    )
    return [vodSuggesting]
  }

  /**
   * This will build the EditorSuggestContext in getSuggestions
   * This is monitoring when --vod got typed.
   * Make sure the trigger not conflicts with other suggesters.
   * @param cursor
   * @param editor
   * @param file
   */
  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    file: TFile
  ): EditorSuggestTriggerInfo | null {
    // this variable holds the full query content, in this case --vod or ++vod
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

    if (queryContent === 'vod') {
      EventStats.logUIOpen(
        'vodEditorOpen',
        { key: `${this.settings.bibleVersion}-vod`, value: 1 },
        this.settings.optOutToEvents
      )
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf(currentContent),
        },
        query: currentContent,
      }
    }
    return null
  }

  renderSuggestion(suggestion: VerseOfDaySuggesting, el: HTMLElement): void {
    const outer = el.createDiv({ cls: 'obr-suggester-container' })
    outer.createDiv({ cls: 'obr-shortcode' }).setText(suggestion.bodyContent)
  }

  selectSuggestion(
    suggestion: VerseOfDaySuggesting,
    evt: MouseEvent | KeyboardEvent
  ): void {
    if (this.context) {
      this.context.editor.replaceRange(
        suggestion.allFormattedContent,
        this.context.start,
        this.context.end
      )
    }
  }
}
