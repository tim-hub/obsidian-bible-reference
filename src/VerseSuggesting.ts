import { DEFAULT_SETTINGS } from './data/constants';
import { BibleVersionCollection } from './data/BibleVersionCollection';
import { IBibleVersion } from './interfaces/IBibleVersion';
import { IVerseSuggesting } from './interfaces/IVerseSuggesting';
import { IVerse } from './interfaces/IVerse';
import { BibleAPIFactory } from './provider/BibleAPIFactory';
import { BibleProvider } from './provider/BibleProvider';


export class VerseSuggesting implements IVerseSuggesting {
  public text: string;
  public bibleVersion: string;
  private bibleProvider: BibleProvider;

  constructor(public bookName: string, public chapterNumber: number, public verseNumber: number, public verseNumberEnd?: number, bibleVersion?: string,) {
    this.bookName = bookName;
    this.chapterNumber = chapterNumber;
    this.verseNumber = verseNumber;
    this.verseNumberEnd = verseNumberEnd;
    this.bibleVersion = bibleVersion ?? BibleVersionCollection[0].key;
  }

  public get ReplacementContent(): string {
    return `> [!Bible] \n`
      + `> ${this.text.trim()} \n`
      + `> \n ${this.getVerseReference()}`
  }

  public async getVerses(): Promise<IVerse[]> {
    console.debug(this.bibleVersion);
    if (this.bibleVersion === DEFAULT_SETTINGS.bibleVersion) {
      console.log('match to default language plus version');
    }
    const bibleVersion = BibleVersionCollection.find((bv: IBibleVersion) => bv.key === this.bibleVersion) ?? BibleVersionCollection[0];
    if (!this.bibleProvider || this.bibleProvider.BibleVersionKey !== bibleVersion?.key) {
      // make sure this is only 1 adapter, and it is the same bible version
      this.bibleProvider = BibleAPIFactory.Instance.BuildBibleVersionAPIAdapterFromIBibleVersion(bibleVersion);
    }
    return this.bibleProvider.query(
      this.bookName,
      this.chapterNumber,
      this?.verseNumberEnd
        ? [this.verseNumber, this.verseNumberEnd]
        : [this.verseNumber]
    );
  }

  public async fetchAndSetVersesText(): Promise<void> {
    // todo add a caching here, this might not be possible with Obsidian limit
    const verses = await this.getVerses();
    let text = '';
    verses.forEach(verse => {
      text += verse.text.replace('\n', '\n>');
    });
    this.text = text;
  }

  public getVerseReference(): string {
    return ` [${this.bibleProvider.BibleReferenceHead} - ${this.bibleVersion.toUpperCase()}](${this.bibleProvider.QueryURL})\n\n`;
  }
}
