import { describe, expect, it } from 'bun:test'
import { buildProvider } from './buildProvider'
import { BibleAPIDotComProvider } from './BibleAPIDotComProvider'
import { BollyLifeProvider } from './BollyLifeProvider'
import { BibleSuperSearchProvider } from './BibleSuperSearchProvider'
import { BibleAPISourceCollection } from '../data/BibleApiSourceCollection'
import { IBibleVersion } from '../interfaces/IBibleVersion'

const version = (apiSource: IBibleVersion['apiSource']): IBibleVersion => ({
  key: 'kjv',
  versionName: 'King James Version',
  language: 'en',
  apiSource,
})

describe('buildProvider', () => {
  it('builds BollyLifeProvider for bollsLife source', () => {
    expect(
      buildProvider(version(BibleAPISourceCollection.bollsLife))
    ).toBeInstanceOf(BollyLifeProvider)
  })

  it('builds BibleSuperSearchProvider for bibleSuperSearch source', () => {
    expect(
      buildProvider(version(BibleAPISourceCollection.bibleSuperSearch))
    ).toBeInstanceOf(BibleSuperSearchProvider)
  })

  it('builds BibleAPIDotComProvider for bibleApi source', () => {
    expect(
      buildProvider(version(BibleAPISourceCollection.bibleApi))
    ).toBeInstanceOf(BibleAPIDotComProvider)
  })

  it('defaults to BibleAPIDotComProvider for an unknown source', () => {
    expect(
      buildProvider(version({ name: 'Unknown', apiUrl: 'https://x' }))
    ).toBeInstanceOf(BibleAPIDotComProvider)
  })
})
