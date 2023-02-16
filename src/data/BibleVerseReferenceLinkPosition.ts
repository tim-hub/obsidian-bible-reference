export enum BibleVerseReferenceLinkPosition {
  Header = 'Header',
  Bottom = 'Bottom',
  AllAbove = 'Both',
}

export const BibleVerseReferenceLinkPositionCollection = [
  {
    name: BibleVerseReferenceLinkPosition.Header,
    description: 'Header (Bible Verse Header)',
  },
  {
    name: BibleVerseReferenceLinkPosition.Bottom,
    description: 'Bottom (Bottom of Bible Verse Content)',
  },
  {
    name: BibleVerseReferenceLinkPosition.AllAbove,
    description: 'Both (Both of Above)',
  },
]
