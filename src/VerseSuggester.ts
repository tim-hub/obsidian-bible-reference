import { Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from 'obsidian';
import BibleReferencePlugin from '../main';
import { matchingBooks } from './data/abbreviations';
import { VerseTypoCheck } from './VerseTypoCheck';

export interface IVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface IVerseSuggest {
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  verseNumberEnd?: number;
  verses?: IVerse[];
}

/**
 * Get public World Engligh Bible version
 */
export class VerseSuggest{
  public text: string;

  constructor(public bookName: string, public chapterNumber: number, public verseNumber: number, public verseNumberEnd?: number) {
    this.bookName = bookName;
    this.chapterNumber = chapterNumber;
    this.verseNumber = verseNumber;
    this.verseNumberEnd = verseNumberEnd;
  }

  /**
   * Get the verse text
   * todo tweak it to avoid unecessary call
   * @private
   */
  private get queryString():string {
    let queryString = `${this.bookName}+${this.chapterNumber}:`;
    if (this?.verseNumberEnd) {
      queryString += `${this.verseNumber}-${this.verseNumberEnd}`;
    } else {
      queryString += `${this.verseNumber}`;
    }
    return queryString;
  }

  private async getVerses(): Promise<IVerse[]> {
    const url = `https://bible-api.com/${this.queryString}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.verses;
  }

  public async fetchAndSetVersesText(): Promise<void> {
    const verses = await this.getVerses();
    let text = '';
    verses.forEach(verse => {
      text += verse.text;
    });
    this.text = text;
  }
}

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseSuggester extends EditorSuggest<VerseSuggest> {
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

  /**
   * Suggest bible verses.
   * @param context
   */
  async getSuggestions(context: EditorSuggestContext): Promise<VerseSuggest[]> {
    console.debug('get suggestion for query ', context.query.toLowerCase());
    const bookStarIndex = 3;
    const bookEndIndex= context.query.lastIndexOf(' ');
    const bookName = context.query.substring(bookStarIndex, bookEndIndex);
    const chapterEndIndex = context.query.lastIndexOf(':');
    const chapterNumber = context.query.substring(bookEndIndex+1, chapterEndIndex);
    const verseEndIndex = context.query.lastIndexOf('-') ;
    let verseSuggest: VerseSuggest;
    if (verseEndIndex !== -1) {
      const verseNumber = context.query.substring(chapterEndIndex+1, verseEndIndex);
      const verseEndNumber = context.query.substring(verseEndIndex+1);
      verseSuggest = new VerseSuggest(bookName, parseInt(chapterNumber), parseInt(verseNumber), parseInt(verseEndNumber));
    } else {
      const verseNumber = context.query.substring(chapterEndIndex+1);
      verseSuggest = new VerseSuggest(bookName, parseInt(chapterNumber), parseInt(verseNumber));
    }
    await verseSuggest.fetchAndSetVersesText();
    return [verseSuggest];


  }

  renderSuggestion(suggestion: VerseSuggest, el: HTMLElement): void {
    // todo render bible verseNumber in the suggestion in a spercific length
    const outer = el.createDiv({ cls: "ES-suggester-container" });
    outer.createDiv({ cls: "ES-shortcode" }).setText(suggestion.text);
  }

  selectSuggestion(suggestion: VerseSuggest): void {
    if(this.context) {
      (this.context.editor as Editor).replaceRange( `${suggestion.text} `, this.context.start, this.context.end);
    }
  }
}
