import { BaseVerseFormatter } from './BaseVerseFormatter'
import { BibleReferencePluginSettings } from '../data/constants'
import { VerseReference } from '../utils/splitBibleReference'

export class VerseOfDaySuggesting extends BaseVerseFormatter {
  constructor(
    settings: BibleReferencePluginSettings,
    public verseReference: VerseReference,
    public verseTexts?: string[]
  ) {
    super(settings, verseReference, verseTexts)
  }



  public getVerseReferenceLink(): string {
    const { bookName, chapterNumber, verseNumber, verseNumberEnd } =
      this.verseReference
    return ` Verse of the Day [${bookName} ${chapterNumber}:${verseNumber}${
      verseNumberEnd ? `-${verseNumberEnd}` : ''
    }](https://beta.ourmanna.com/api/v1/get?format=json&order=daily)`
  }
}
