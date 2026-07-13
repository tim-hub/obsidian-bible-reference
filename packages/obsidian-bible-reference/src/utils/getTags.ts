import { DEFAULT_SETTINGS } from '../data/constants'

export const getBookTag = (
  bookName: string,
  bookTaggingFormat: string = DEFAULT_SETTINGS.bookTaggingFormat
): string => {
  return `#${(bookTaggingFormat || DEFAULT_SETTINGS.bookTaggingFormat)
    .replaceAll('{{book}}', bookName)
    .replace(/ /g, '')}`
}

export const getChapterTag = (
  bookName: string,
  chapterNumber: string | number,
  chapterTaggingFormat: string = DEFAULT_SETTINGS.chapterTaggingFormat
): string => {
  return `#${(chapterTaggingFormat || DEFAULT_SETTINGS.chapterTaggingFormat)
    .replaceAll('{{book}}', bookName)
    .replaceAll('{{chapter}}', String(chapterNumber))
    .replace(/ /g, '')}`
}
