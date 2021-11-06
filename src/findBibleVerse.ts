/**
 * Fetch bible verseNumber from bible-api.com
 */
export const findBibleVerse = async (
  book: string,
  chapter: number,
  verse: number,
) => {
  const url = `https://bible-api.com/${book}+${chapter}:${verse}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
