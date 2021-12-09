import { DEFAULT_SETTINGS } from './data/constants';
import {
  BibleVersionAPIAdapter,
} from './data/BibleVersionApiAdapter';
import { BibleVersionCollection, IBibleVersion } from './data/BibleVersionCollection';

export interface IVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Get public World Engligh Bible bibleVersion
 */
export class VerseSuggesting {
  private bibleVersionApiAdapter: BibleVersionAPIAdapter;
  public text: string;
  public bibleVersion : string;

  constructor(public bookName: string, public chapterNumber: number, public verseNumber: number, public verseNumberEnd?: number, bibleVersion?:string,) {
    this.bookName = bookName;
    this.chapterNumber = chapterNumber;
    this.verseNumber = verseNumber;
    this.verseNumberEnd = verseNumberEnd;
    this.bibleVersion = bibleVersion;
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
    console.debug(this.bibleVersion);
    if (this.bibleVersion === DEFAULT_SETTINGS.bibleVersion) {
      console.log('match to default language plus version');
    }
    const bibleVersion = BibleVersionCollection.find((bv: IBibleVersion) => bv.key === this.bibleVersion)
    if (!this.bibleVersionApiAdapter || this.bibleVersionApiAdapter.BibleVersionKey !== bibleVersion.key) {
      this.bibleVersionApiAdapter =  BibleVersionAPIAdapter.BuildBibleVersionAPIAdapterFromIBibleVersion(bibleVersion);
    }
    return this.bibleVersionApiAdapter.query(this.queryString);
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
    return `-- [${this.bookName} ${this.chapterNumber}:${this.verseNumber}${this.verseNumberEnd? `-${this.verseNumberEnd}`:''}](${this.bibleVersionApiAdapter.VersesUrl})`;
  }

  public get ReplacementContent(): string {
    return `> ${this.text+`>> ${this.getVerseReference()}`}`
  }
}
