export enum BibleVerseReferenceLinkPosition {
  Header = 'Header',
  Bottom = 'Bottom',
  AllAbove = 'Both',
  None = 'None',
}

export const BibleVerseReferenceLinkPositionCollection = [
  {
    name: BibleVerseReferenceLinkPosition.None,
    description: 'Hide (Clean and Simple)',
  },
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
    description: 'Both Header and Bottom',
  },
]
