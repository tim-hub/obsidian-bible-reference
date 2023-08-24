import { BibleAPIDotComProvider } from './BibleAPIDotComProvider';
import { IBibleVersion } from '../interfaces/IBibleVersion';
import { IVerse } from '../interfaces/IVerse';


export class NetBibleProvider extends BibleAPIDotComProvider {

  constructor(bibleVersion: IBibleVersion) {
    super(bibleVersion);
  }

  public buildRequestURL(
    bookName: string,
    chapter: number,
    verses: number[],
    versionName?: string
  ): string {
    let queryString = `${bookName}+${chapter}:`
    if (verses?.length >= 3) {
      queryString += verses.join('&')
    } else if (verses?.length === 2 && !!verses[1]) {
      queryString += `${verses[0]}-${verses[1]}`
    } else {
      queryString += `${verses[0]}`
    }
    this._queryUrl = `${this._apiUrl}&passage=${queryString}`
    return this._queryUrl
  }

  protected formatBibleVerses(data: any): IVerse[] {
    return data.map(
      // from [{"bookname":"John","chapter":"1","verse":"1","text":"In the beginning was the Word, and the Word was with God, and the Word was fully God. "}]
      // to IVerse
      ({bookname, chapter, verse, text}: { bookname: string, chapter: string, verse: string, text: string }) => {
        return {
          book_id: bookname,
          book_name: bookname,
          chapter: parseInt(chapter),
          verse: parseInt(verse),
          text,
        } as IVerse
      }
    )
  }
}
