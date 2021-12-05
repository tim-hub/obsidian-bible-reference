import { DEFAULT_SETTINGS, LanguageVersionSplitter } from './constants';

export interface IVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Get public World Engligh Bible languagePlusVersion
 */
export class SuggestingVerse {
  public text: string;
  public languagePlusVersion : string;
  public version: string;
  public language :string;

  constructor(public bookName: string, public chapterNumber: number, public verseNumber: number, public verseNumberEnd?: number, languagePlusVersion?:string,) {
    this.bookName = bookName;
    this.chapterNumber = chapterNumber;
    this.verseNumber = verseNumber;
    this.verseNumberEnd = verseNumberEnd;
    this.languagePlusVersion = languagePlusVersion;
    [this.language, this.version] = languagePlusVersion.split(LanguageVersionSplitter)
  }

  /**
   * Get the verse text
   * @private
   */
  private get queryString():string {
    let queryString = `${this.bookName}+${this.chapterNumber}:`;
    if (this?.verseNumberEnd > 0) {
      queryString += `${this.verseNumber}-${this.verseNumberEnd}`;
    } else {
      queryString += `${this.verseNumber}`;
    }
    return queryString;
  }

  private async getVerses(): Promise<IVerse[]> {
    console.debug(this.languagePlusVersion);
    const url = `https://bible-api.com/${this.queryString}`;
    const response = await fetch(url);
    const data = await response.json();

    if (this.languagePlusVersion === DEFAULT_SETTINGS.languagePlusVersion) {
      console.log('match to default language plus version');
    }
    return data.verses;
  }

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here

    const verses = await this.getVerses();
    let text = '';
    verses.forEach(verse => {
      text += verse.text;
    });
    this.text = text;
  }

  public getVerseReference(): string {
    return `-- ${this.bookName} ${this.chapterNumber}:${this.verseNumber}${this.verseNumberEnd? `-${this.verseNumberEnd}`:''}`;
  }
}
