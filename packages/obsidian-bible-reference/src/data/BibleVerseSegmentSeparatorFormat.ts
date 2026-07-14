export enum BibleVerseSegmentSeparatorFormat {
  VerseSeparator = 'Verse Separator',
  SingleBlock = 'Single Block',
}

export const BibleVerseSegmentSeparatorFormatCollection = [
  {
    name: BibleVerseSegmentSeparatorFormat.VerseSeparator,
    description: 'Verse Separator (Add divider between non-contiguous verses)',
  },
  {
    name: BibleVerseSegmentSeparatorFormat.SingleBlock,
    description: 'Single Block (No divider)',
  },
]
