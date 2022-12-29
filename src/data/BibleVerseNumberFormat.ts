export enum BibleVerseNumberFormat {
  Period = '1. ',
  PeriodParenthesis = '1.) ',
  Parenthesis = '1) ',
  Dash = '1 - ',
  NumberOnly = '1 ',
  None = 'None'
}

export const BibleVerseNumberFormatCollection = [
  {
    name: BibleVerseNumberFormat.Period,
    description: '1. '
  },
  {
    name: BibleVerseNumberFormat.PeriodParenthesis,
    description: '1.) '
  },
  {
    name: BibleVerseNumberFormat.Parenthesis,
    description: '1) '
  },
  {
    name: BibleVerseNumberFormat.Dash,
    description: '1 - '
  },
  {
    name: BibleVerseNumberFormat.NumberOnly,
    description: '1 '
  },
  {
    name: BibleVerseNumberFormat.None,
    description: 'None'
  }
]

