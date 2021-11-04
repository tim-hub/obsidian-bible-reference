import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import BibleReferencePlugin from '../main';
import { matchingBooks } from './data/abbreviations';
import { VerseTypoCheck } from './VerseTypoCheck';

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
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch);
    const match = VerseTypoCheck(currentContent);
    if (match) {
      console.debug('trigger on', currentContent);
      const editorSuggestTriggerInfo:EditorSuggestTriggerInfo = {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf(match),
        },
        query: match,
      };
      return editorSuggestTriggerInfo;
    }
    return null;
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    console.debug('get suggestion for query ', context.query.toLowerCase());
    const matchingChapterName = context.query.substring(3, context.query.lastIndexOf(' '));
    console.log('matchingChapterName', matchingChapterName);
    const suggestions = matchingBooks.filter(book=>book.toLowerCase().startsWith(matchingChapterName.toLowerCase()));
    console.debug('suggestions', suggestions, 'all options', matchingBooks);
    return Array.from(new Set(suggestions));
  }

  renderSuggestion(suggestion: string, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "ES-suggester-container" });
    outer.createDiv({ cls: "ES-shortcode" }).setText(suggestion.replace(/:/g, ""));
  }

  selectSuggestion(suggestion: string): void {
    if(this.context) {
      (this.context.editor as Editor).replaceRange( `${suggestion} `, this.context.start, this.context.end);
    }
  }
}
