import { BibleReferencePluginSettings, DEFAULT_SETTINGS } from './data/constants';
import { BibleVersionCollection } from './data/BibleVersionCollection';
import { IBibleVersion } from './interfaces/IBibleVersion';
import { IVerseSuggesting } from './interfaces/IVerseSuggesting';
import { IVerse } from './interfaces/IVerse';
import { BibleAPIFactory } from './provider/BibleAPIFactory';
import { BibleProvider } from './provider/BibleProvider';
import { BibleVerseReferenceLinkPosition } from './data/BibleVerseReferenceLinkPosition';


export class VerseSuggesting implements IVerseSuggesting {
  public text: string;
  public bibleVersion: string;
  private bibleProvider: BibleProvider;

  constructor(public settings: BibleReferencePluginSettings, public bookName: string, public chapterNumber: number, public verseNumber: number, public verseNumberEnd?: number,) {
    this.bookName = bookName;
    this.chapterNumber = chapterNumber;
    this.verseNumber = verseNumber;
    this.verseNumberEnd = verseNumberEnd;
    this.bibleVersion = settings.bibleVersion;
  }

  /**
   * To get the content of the bible verses
   * @constructor
   */
  public get ReplacementContent(): string {
    let head = `> [!Bible] `;
    let bottom = '';
    if (this.settings.referenceLinkPosition === BibleVerseReferenceLinkPosition.Header || this.settings.referenceLinkPosition ===  BibleVerseReferenceLinkPosition.AllAbove ) {
      head += this.getVerseReference();
    }
    if (this.settings.referenceLinkPosition === BibleVerseReferenceLinkPosition.Bottom || this.settings.referenceLinkPosition ===  BibleVerseReferenceLinkPosition.AllAbove) {
      bottom += `> \n ${this.getVerseReference()}`
    }
    return [
      head,
      `> ${this.text.trim()}`,
      bottom
    ].join('\n')
  }

  public async getVerses(): Promise<IVerse[]> {
    console.debug(this.bibleVersion);
    if (this.bibleVersion === DEFAULT_SETTINGS.bibleVersion) {
      console.debug('match to default language plus version');
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
    return ` [${this.bibleProvider.BibleReferenceHead} - ${this.bibleVersion.toUpperCase()}](${this.bibleProvider.QueryURL})`;
  }
}
