import { Notice } from 'obsidian'
import { IBibleVersion } from '../interfaces/IBibleVersion'
import { IVerse } from '../interfaces/IVerse'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { bookNameForId } from '../utils/bookNameReference'
import { PassageQuery, VerseSource, versesQueryString } from './verseSource'
import { bibleApiSource } from './bibleApiSource'
import { bollsLifeSource } from './bollsLifeSource'
import { bibleSuperSearchSource } from './bibleSuperSearchSource'
import { verseCache, expandRequestedVerses } from './verseCache'
import { offlineLookup } from './offlineBible'

export type { PassageQuery } from './verseSource'

const isOffline = (version: IBibleVersion): boolean =>
  version.apiSource === BibleAPISourceCollection.offline

const sourceFor = (version: IBibleVersion): VerseSource => {
  switch (version.apiSource) {
    case BibleAPISourceCollection.bollsLife:
      return bollsLifeSource
    case BibleAPISourceCollection.bibleSuperSearch:
      return bibleSuperSearchSource
    default:
      return bibleApiSource
  }
}

const fetchVersesFor = (
  source: VerseSource,
  query: PassageQuery,
  requested: number[] | null,
  missing: number[]
): number[] => {
  if (source.readsWholeChapter) {
    return [1, 999]
  }
  const partialHit =
    missing.length > 0 && !!requested && missing.length < requested.length
  return partialHit ? missing : query.verses
}

export const sourceUrlFor = (
  version: IBibleVersion,
  query: PassageQuery
): string =>
  isOffline(version)
    ? `https://bible-api.com/${bookNameForId(query.bookId, 'en')}+${query.chapter}:${versesQueryString(query.verses)}?translation=web`
    : sourceFor(version).sourceUrl(version, query)

export const lookupVerses = async (
  version: IBibleVersion,
  query: PassageQuery
): Promise<IVerse[]> => {
  const bookName = bookNameForId(query.bookId, 'en')
  if (isOffline(version)) {
    return await offlineLookup(bookName, query.chapter, query.verses)
  }

  const source = sourceFor(version)
  const requested = expandRequestedVerses(query.verses)
  let missing: number[] = []
  if (requested) {
    const cached = verseCache.getVerses(
      version.key,
      bookName,
      query.chapter,
      requested
    )
    if (cached.missing.length === 0 && cached.hits.length) {
      return cached.hits
    }
    missing = cached.missing
  }

  const fetchQuery = {
    ...query,
    verses: fetchVersesFor(source, query, requested, missing),
  }
  const fetchUrl = source.requestUrl(version, fetchQuery)
  console.debug(fetchUrl, 'url to query')
  try {
    const response = await fetch(fetchUrl, {
      method: 'get',
      redirect: 'follow',
      cache: 'force-cache',
    })
    const fetched = source.parse(await response.json(), version, fetchQuery)
    verseCache.putVerses(version.key, bookName, query.chapter, fetched)
    if (!requested) {
      return fetched
    }
    const { hits } = verseCache.getVerses(
      version.key,
      bookName,
      query.chapter,
      requested
    )
    return hits.length ? hits : fetched
  } catch (error) {
    console.error('error while querying', error)
    const offline = await offlineLookup(bookName, query.chapter, query.verses)
    if (offline.length) {
      console.debug('falling back to bundled offline WEB verses')
      return offline
    }
    new Notice(`Error while querying ${fetchUrl}`)
    throw error
  }
}
