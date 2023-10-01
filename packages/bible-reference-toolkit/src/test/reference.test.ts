import Reference from '../lib/reference';


describe('Reference Original Test in English', () => {
  test('isChapter() returns true for chapter references', () => {
    let ref = new Reference('Genesis 1');
    expect(ref.isChapter()).toBe(true);
  });

  test('isChapter() returns false for verse references', () => {
    let ref = new Reference('Genesis 1:7');
    expect(ref.isChapter()).toBe(false);
  });

  test('isChapter() returns false for the first verse in a chapter', () => {
    let ref = new Reference('Genesis 1:1');
    expect(ref.isChapter()).toBe(false);
  });

  test('startOf("book") moves ref to start of book', () => {
    let ref = new Reference('Genesis 2:3');
    ref.startOf('book');
    expect(ref.toVerseId()).toBe(1);
  });

  test('startOf("chapter") moves ref to start of chapter', () => {
    let ref = new Reference('Genesis 1:4');
    ref.startOf('chapter');
    expect(ref.toVerseId()).toBe(1);
  });

  test('clone() creates a copy of the ref', () => {
    let ref1 = new Reference('Genesis 1:4');
    let ref2 = ref1.clone();
    ref1.startOf('chapter');
    expect(ref1).not.toBe(ref2);
    expect(ref1.toVerseId()).not.toBe(ref2.toVerseId());
  });

  test('toString() returns the text reference', () => {
    let ref = Reference.fromVerseId(32);
    expect(ref.toString()).toBe('Genesis 2:1');
  });

  test('toVerseId() returns the verse id', () => {
    let ref = new Reference('Genesis 1:1');
    expect(ref.toVerseId()).toBe(1);
    ref = new Reference('Exodus 1:1');
    expect(ref.toVerseId()).toBe(1534);
  });

  test('toChapterId() returns the chapter id', () => {
    let ref = new Reference('Genesis 1:1');
    expect(ref.toChapterId()).toBe(1);
    ref = new Reference('Exodus 1:1');
    expect(ref.toChapterId()).toBe(51);
  });

  test('toBookId() returns the book id', () => {
    let ref = new Reference('Genesis 1:1');
    expect(ref.toBookId()).toBe(1);
    ref = new Reference('Exodus 1:1');
    expect(ref.toBookId()).toBe(2);
  });

  test('Reference.bookIdFromName() returns the book id', () => {
    expect(Reference.bookIdFromName('Exodus')).toBe(2);
  });

  test('Reference.bookNameFromId() returns the number of chapters in all books prior to the given book id', () => {
    expect(Reference.bookNameFromId(2)).toBe('Exodus');
  });

  test('Reference.fromChapterId() returns a reference instance for the chapter id', () => {
    expect(Reference.fromChapterId(51).toString()).toBe('Exodus 1');
  });

  test('Reference.fromVerseId() returns a reference instance for the verse id', () => {
    expect(Reference.fromVerseId(1534).toString()).toBe('Exodus 1:1');
  });

  test('Reference.versesInBookId() returns the total number of verses in that book', () => {
    expect(Reference.versesInBookId(1)).toBe(1533); // Genesis
  });

  test('Reference.versesInChapterId() returns the total number of verses in that chapter', () => {
    expect(Reference.versesInChapterId(51)).toBe(22); // Exodus 1
  });

  test('Reference.chaptersInBookId() returns the number of chapters in that book', () => {
    expect(Reference.chaptersInBookId(1)).toBe(50); // Genesis
  });

  test('Reference.versesUpToBookId() returns the number of verses in all books prior to the given book id', () => {
    expect(Reference.versesUpToBookId(3)).toBe(2746); // Leviticus
  });

  test('Reference.versesUpToChapterId() returns the number of verses in all chapters of all books prior to the given chapter id', () => {
    expect(Reference.versesUpToChapterId(51)).toBe(1533); // Exodus 1
  });

  test('Reference.chaptersUpToBookId() returns the number of chapters in all books prior to the given book id', () => {
    expect(Reference.chaptersUpToBookId(2)).toBe(50); // Exodus
  });

})