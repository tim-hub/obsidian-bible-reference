import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import BibleReferencePlugin from '../main';
import { BibleReferencePluginSettings } from '../data/constants';
import { getVod, VerseOfDayResponse } from '../provider/VODProvider';


export class VerseOfDayEditorSuggester extends EditorSuggest<string> {
  private plugin: BibleReferencePlugin;
  private settings: BibleReferencePluginSettings;

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
    this.plugin = plugin
    this.settings = settings
  }

  async getSuggestions(context: EditorSuggestContext): Promise<string[]> {
    const vodResp = await getVod();
    return [this.buildSuggestion(vodResp)];
  }

  /**
   * This will build the EditorSuggestContext in getSuggestions
   * This is monitoring when --vod got typed.
   * Make sure the trigger not conflicts with other suggesters.
   * @param cursor
   * @param editor
   * @param file
   */
  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
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

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    const outer = el.createDiv({cls: 'obr-suggester-container'})
    outer.createDiv({cls: 'obr-shortcode'}).setText(suggestion)
  }

  selectSuggestion(suggestion: string, evt: MouseEvent | KeyboardEvent): void {
    if (this.context) {
      /* prettier-ignore */
      (this.context.editor as Editor).replaceRange(
        suggestion,
        this.context.start,
        this.context.end
      )
    }
  }

  private buildSuggestion(vod: VerseOfDayResponse): string {
    return `> [!Bible] ${vod.verse.details.reference}
> ${vod.verse.details.text}
    `
  }

}
