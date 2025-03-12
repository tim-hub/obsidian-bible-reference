export enum BibleVerseNumberFormat {
  Period = '1. ',
  PeriodParenthesis = '1.) ',
  Parenthesis = '1) ',
  Dash = '1 - ',
  NumberOnly = '1 ',
  SuperScript = '^1',
  SuperScriptBold = '**^1**',
  SuperScriptItalic = '*^1*',
  Bold = '**1**',
  Italic = '*1*',
  None = 'None',
}

export const BibleVerseNumberFormatCollection = [
  // {
  //   name: BibleVerseNumberFormat.Period,
  //   description: '1. ',
  // },
  {
    name: BibleVerseNumberFormat.PeriodParenthesis,
    description: '1.) ',
  },
  {
    name: BibleVerseNumberFormat.Parenthesis,
    description: '1) ',
  },
  {
    name: BibleVerseNumberFormat.Dash,
    description: '1 - ',
  },
  {
    name: BibleVerseNumberFormat.NumberOnly,
    description: '1 ',
  },
  {
    name: BibleVerseNumberFormat.SuperScript,
    description: '^1 (superscript)',
  },
  {
    name: BibleVerseNumberFormat.SuperScriptBold,
    description: '**^1** (bolded superscript)',
  },
  {
    name: BibleVerseNumberFormat.SuperScriptItalic,
    description: '*^1* (italic superscript)',
  },
  {
    name: BibleVerseNumberFormat.Bold,
    description: '**1** (bold)',
  },
  {
    name: BibleVerseNumberFormat.Italic,
    description: '*1* (italic)',
  },
  {
    name: BibleVerseNumberFormat.None,
    description: 'None',
  },
]
