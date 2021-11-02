import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import BibleReferencePlugin from '../main';

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseSuggester extends EditorSuggest<string> {
  plugin: BibleReferencePlugin;

  constructor(plugin: BibleReferencePlugin) {
    super(plugin.app);
    this.plugin = plugin;
  }

  onTrigger(cursor: EditorPosition, editor: Editor, _: TFile): EditorSuggestTriggerInfo | null {
    if (true) {
      const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
      const match = sub.match(/@\S+$/)?.first();
      if (match) {
        return {
          end: cursor,
          start: {
            ch: sub.lastIndexOf(match),
            line: cursor.line,
          },
          query: match,
        }
      }
    }
    return null;
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    return ['In the beginning',
    'Woop'
    ];
  }

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "ES-suggester-container" });
    outer.createDiv({ cls: "ES-shortcode" }).setText(suggestion.replace(/:/g, ""));
    outer.createDiv({ cls: "ES-emoji" }).setText(suggestion);
  }

  selectSuggestion(suggestion: string): void {
    if(this.context) {
      (this.context.editor as Editor).replaceRange( `${suggestion} `, this.context.start, this.context.end);
    }
  }
}
