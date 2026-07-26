import { BOOK_REG, BOOK_VERSE_REG, DASH_CHARS, normalizeDashes } from './regs'

describe('test book name reg matching in different languages', () => {
  test('should match book name in English', () => {
    const bookName = 'John'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Italian', () => {
    const bookName = 'Giovanni'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Japanese', () => {
    const bookName = 'ヨハネ'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Spanish', () => {
    const bookName = 'Juan'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Chinese', () => {
    const bookName = '约翰福音'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in French', () => {
    const bookName = 'Josué'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should not cover just one letter', () => {
    const bookName = 'J'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(false)
  })
})

describe('test modal reg matching in different languages', () => {
  test('should match modal in English', () => {
    const modal = 'John 1:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match modal in English Without Space', () => {
    const modal = 'John1:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(true)
  })

  test('should match book name in French', () => {
    const bookName = 'Josué1:1'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should match book name in Chinese', () => {
    const bookName = '约翰福音2:1'
    const reg = new RegExp(BOOK_REG)
    expect(reg.test(bookName)).toBe(true)
  })

  test('should not match if use letter for number', () => {
    const modal = 'John a:1'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(modal)).toBe(false)
  })
})

describe('cross-chapter regex matching', () => {
  test('should match cross-chapter reference', () => {
    const ref = 'Hebrews 9:1-10:14'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should match cross-chapter reference without space', () => {
    const ref = 'Hebrews9:1-10:14'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should capture full cross-chapter reference', () => {
    const ref = 'Hebrews 9:1-10:14'
    const match = ref.match(BOOK_VERSE_REG)
    expect(match?.[0]).toBe('Hebrews 9:1-10:14')
  })

  test('should match numbered book cross-chapter', () => {
    const ref = '1 Corinthians 15:50-16:4'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should still match same-chapter verse range', () => {
    const ref = 'John 3:16-21'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })

  test('should still match single verse', () => {
    const ref = 'John 3:16'
    const reg = new RegExp(BOOK_VERSE_REG)
    expect(reg.test(ref)).toBe(true)
  })
})

describe('abbreviations written with a period', () => {
  test.each([
    ['Eph. 2:8', 'Eph.'],
    ['Matt. 5:3', 'Matt.'],
    ['Gen. 1:1-3', 'Gen.'],
    ['1 Cor. 13:4', '1 Cor.'],
  ])('BOOK_REG captures the book of %s', (ref, expected) => {
    expect(ref.match(BOOK_REG)?.[0]).toBe(expected)
  })

  test.each([
    'Eph. 2:8',
    'Matt. 5:3',
    'Gen. 1:1-3',
    '1 Cor. 13:4',
    '1 Cor. 13:4-7',
    'Mk. 2:1',
  ])('BOOK_VERSE_REG captures all of %s', (ref) => {
    expect(ref.match(BOOK_VERSE_REG)?.[0]).toBe(ref)
  })
})

describe('multi-word book names', () => {
  test.each([
    ['Song of Solomon 1:1', 'Song of Solomon'],
    ['Song of Songs 2:1', 'Song of Songs'],
  ])('BOOK_REG keeps %s together', (ref, expected) => {
    expect(ref.match(BOOK_REG)?.[0]).toBe(expected)
  })

  test.each(['Song of Solomon 1:1', 'Song of Songs 2:1'])(
    'BOOK_VERSE_REG captures all of %s',
    (ref) => {
      expect(ref.match(BOOK_VERSE_REG)?.[0]).toBe(ref)
    }
  )

  test('stops at the chapter number rather than running on', () => {
    expect('John 3:16'.match(BOOK_REG)?.[0]).toBe('John')
  })
})

describe('unicode dashes in verse ranges', () => {
  // The regression these guard: BOOK_VERSE_REG used to stop dead at a non-ASCII
  // dash, capturing "John 3:16" out of "John 3:16-18" and quietly dropping the
  // rest of the range.
  test.each([...DASH_CHARS])('captures the whole range across %s', (dash) => {
    const ref = `John 3:16${dash}18`
    expect(ref.match(BOOK_VERSE_REG)?.[0]).toBe(ref)
  })

  test.each([...DASH_CHARS])(
    'captures the whole cross-chapter range across %s',
    (dash) => {
      const ref = `Hebrews 9:1${dash}10:14`
      expect(ref.match(BOOK_VERSE_REG)?.[0]).toBe(ref)
    }
  )

  test('normalizeDashes folds every dash to an ASCII hyphen', () => {
    for (const dash of DASH_CHARS) {
      expect(normalizeDashes(`John 3:16${dash}18`)).toBe('John 3:16-18')
    }
  })

  test('normalizeDashes leaves everything else alone', () => {
    expect(normalizeDashes('Song of Solomon 1:1')).toBe('Song of Solomon 1:1')
  })
})
