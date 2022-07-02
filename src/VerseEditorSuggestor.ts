import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import BibleReferencePlugin from './main';
import { VerseTypoCheck } from './VerseTypoCheck';
import { VerseSuggesting } from './VerseSuggesting';
import { BibleReferencePluginSettings } from './data/constants';

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseEditorSuggestor extends EditorSuggest<VerseSuggesting> {
  plugin: BibleReferencePlugin;
  settings: BibleReferencePluginSettings;

  constructor(plugin: BibleReferencePlugin, settings: BibleReferencePluginSettings) {
    super(plugin.app);
    this.plugin = plugin;
    this.settings = settings;
  }

  /**
   * This will build the EditorSuggestContext in getSuggestions
   * @param cursor
   * @param editor
   * @param _
   */
  onTrigger(cursor: EditorPosition, editor: Editor, _: TFile): EditorSuggestTriggerInfo | null {
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch);
    const match = VerseTypoCheck(currentContent);
    if (match) {
      console.debug('trigger on', currentContent);
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf(match),
        },
        query: match,
      };
    }
    return null;
  }

  /**
   * Suggest bible verses.
   * @param context
   */
  async getSuggestions(context: EditorSuggestContext): Promise<VerseSuggesting[]> {
    console.debug('get suggestion for query ', context.query.toLowerCase());

    const bookName = context.query.match(/[123]*[A-z]{3,}/)?.first();

    if (!bookName) {
      console.error(`could not find through query`, context.query);
      return [];
    }

    const numbersPartsOfQueryString = context.query.substring(2 + bookName.length);
    const numbers = numbersPartsOfQueryString.split(/[-:]+/);

    const chapterNumber = parseInt(numbers[0]);
    const verseNumber = parseInt(numbers[1]);
    const verseEndNumber = numbers.length === 3 ? parseInt(numbers[2]) : undefined;

    // todo get bibleVersion and language from settings
    const suggestingVerse = new VerseSuggesting(bookName, chapterNumber, verseNumber, verseEndNumber, this.settings.bibleVersion);

    console.debug(bookName, chapterNumber, verseNumber, verseEndNumber, suggestingVerse, this.settings.bibleVersion);
    await suggestingVerse.fetchAndSetVersesText();
    return [suggestingVerse];
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement): void {
    const outer = el.createDiv({ cls: "obr-suggester-container" });
    outer.createDiv({ cls: "obr-shortcode" }).setText(suggestion.text);
  }

  selectSuggestion(suggestion: VerseSuggesting): void {
    if(this.context) {
      (this.context.editor as Editor).replaceRange(
        suggestion.ReplacementContent,
        this.context.start,
        this.context.end
      );
    }
  }
}
