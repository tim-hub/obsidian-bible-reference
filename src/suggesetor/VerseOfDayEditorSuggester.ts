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
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch)
    if (currentContent === '--vod') {
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf('--vod'),
        },
        query: '--vod',
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
      /* prettier-ignore */
      (this.context.editor as Editor).replaceRange(
        suggestion.allFormatedContent,
        this.context.start,
        this.context.end
      )
    }
  }
}
