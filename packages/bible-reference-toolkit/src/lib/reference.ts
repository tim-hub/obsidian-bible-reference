import { BibleBooks as books } from './books';
// Internally, no strings are stored - only numbers.
//
// "id"s are UIDs, numbers are relative to parent unit; e.g.
// Mark 2 and James 2 have different ids, but the same number.

export interface IReference {
  book: number;
  chapter: number;
  verse?: number;
}

export class Reference implements IReference {
  public book: number;
  public chapter: number;
  public verse?: number;
  private source?: string;

  constructor(reference: string | IReference) {
    let book;
    let chapter;
    let verse;

    // If reference is a string
    if (typeof reference === 'string') {
      // Strip out any periods, usually used for abbreviations, i.e. Mk. 2
      reference = reference.replace(/\./g, '');
      this.source = reference;

      // Match up to last letter - thats the book. Everything else === the chapter/verse
      const referenceParts = reference.match(/(.+[A-Za-z])\s+(.+)/);

      if (!referenceParts?.length || referenceParts?.length < 3) {
        throw new Error(
          'You must supply a Bible reference, either a string (i.e. "Mark 2") or an object (i.e. { book: 1, chapter: 2, verse: 1 })'
        );
      }
      const bookName = referenceParts[1];
      const chapterAndVerse = referenceParts[2];

      // Lookup the book
      book = Reference.bookIdFromName(bookName);

      // Split on ":" for chapter and verse. If it's a chapter reference
      // (e.g. John 1) then @verse === undefined
      const chapterAndVerseParts = chapterAndVerse.split(':');
      chapter = Number(chapterAndVerseParts[0]);
      verse = chapterAndVerseParts[1]
        ? Number(chapterAndVerseParts[1])
        : undefined;

      // If it's not a string, try parsing as an object
    } else if (
      reference?.book >= 0 &&
      reference?.chapter >= 0 &&
      (!reference?.verse || reference?.verse >= 0)
    ) {
      book = reference.book;
      chapter = reference.chapter;
      verse = reference?.verse;
    } else {
      throw new Error(
        'You must supply a Bible reference, either a string (i.e. "Mark 2") or an object (i.e. { book: 1, chapter: 2, verse: 1 })'
      );
    }

    this.book = book;
    this.chapter = chapter;
    this.verse = verse;
  }

  // Given a string of a book name (shortened or full length), get the book id
  public static bookIdFromName(name: string): number {
    name = name.toLowerCase();
    const relativeBooks = (books as any[]).filter((book) => {
      const bookNames = book.names.map((n: string) => {
        return n.toLowerCase();
      });
      return bookNames.indexOf(name) > -1;
    });
    if (relativeBooks?.length) {
      return books.indexOf(relativeBooks[0]) + 1;
    }
    throw new Error('No book matched "' + name + '"');
  }

  // Like moment.js startOf - ref.startOf('chapter') sets the ref to the first

  // Given a book id, get the full length book name
  public static bookNameFromId(id: number): string {
    const book = books[id - 1];
    if (!book) {
      throw new Error('Book id out of range (no such book)');
    }
    return book.names[0];
  }

  // that number chapter
  public static fromChapterId(chapterId: number): Reference {
    let chaptersRemaining = chapterId;
    let bookIndex = 0;
    while (chaptersRemaining > 0) {
      const chaptersInThisBook = books[bookIndex].verses.length;
      if (chaptersRemaining - chaptersInThisBook <= 0) {
        return new Reference({
          book: bookIndex + 1,
          chapter: chaptersRemaining,
        });
      }
      chaptersRemaining -= chaptersInThisBook;
      bookIndex += 1;
    }
    throw new Error(
      'There was a problem creating the a reference from chapter id ' +
      chapterId
    );
  }

  // Create a Reference from a verse id
  public static fromVerseId(verseId: number): Reference {
    let versesRemaining = verseId;
    let bookIndex = 0;
    while (versesRemaining > 0) {
      const versesInThisBook = Reference.versesInBookId(bookIndex + 1);
      if (versesRemaining - versesInThisBook < 0) {
        const book = books[bookIndex];
        let chapterIndex = 0;
        while (versesRemaining > 0) {
          const versesInThisChapter = book.verses[chapterIndex];
          if (versesRemaining - versesInThisChapter < 0) {
            return new Reference({
              book: bookIndex + 1,
              chapter: chapterIndex + 1,
              verse: versesRemaining,
            });
          }
          versesRemaining -= versesInThisChapter;
          chapterIndex += 1;
        }
      }
      versesRemaining -= versesInThisBook;
      bookIndex += 1;
    }
    throw new Error(
      'There was a problem creating the a reference from verse id ' + verseId
    );
  }

  // Get the number of verses in the given book id
  public static versesInBookId(bookId: number): number {
    return books[bookId - 1].verses.reduce(function sum(a: number, b: number) {
      return a + b;
    });
  }

  // Get the number of verses in the given chapter id
  public static versesInChapterId(chapterId: number): number {
    const reference = Reference.fromChapterId(chapterId);
    return books[reference.book - 1].verses[reference.chapter - 1];
  }

  // Get the number of chapters in the given book id
  public static chaptersInBookId(bookId: number): number {
    return books[bookId - 1].verses.length;
  }

  // Get the number of verses up to the start of the given book id
  public static versesUpToBookId(bookId: number): number {
    let count = 0;
    let booksLeft = bookId - 1;
    while (booksLeft > 0) {
      count += Reference.versesInBookId(booksLeft);
      booksLeft -= 1;
    }
    return count;
  }

  // Get the number of verses up to the start of the given chapter id
  public static versesUpToChapterId(chapterId: number): number {
    let count = 0;
    let chaptersLeft = chapterId - 1;
    while (chaptersLeft > 0) {
      count += Reference.versesInChapterId(chaptersLeft);
      chaptersLeft -= 1;
    }
    return count;
  }

  // Get the number of chapters up to the start of the given book id
  public static chaptersUpToBookId(bookId: number): number {
    let count = 0;
    let booksLeft = bookId - 1;
    while (booksLeft > 0) {
      count += Reference.chaptersInBookId(booksLeft);
      booksLeft -= 1;
    }
    return count;
  }

  // Is a Chapter level reference (no verse)
  public isChapter(): boolean {
    return this.verse == null;
  }

  // go to start of given unit, will make change to this reference
  public startOf(unit: 'chapter' | 'book', clone: Reference = this): Reference {
    if (unit === 'chapter') {
      clone.verse = 1;
    } else if (unit === 'book') {
      clone.verse = 1;
      clone.chapter = 1;
    } else {
      throw new Error(
        'Unknown unit ' +
        unit +
        ' supplied to startOf() - supported units are: "book", "chapter"'
      );
    }
    return clone;
  }

  // Create a clone of this reference, and set it to the start of the given unit
  public cloneToStartOf(unit: 'chapter' | 'book'): Reference {
    const clone = this.clone();
    return this.startOf(unit, clone);
  }

  public clone(): Reference {
    return new Reference(this.toString());
  }

  public toString(): string {
    const bookName = books[this.book - 1].fullName;
    let tmpString = bookName + ' ' + this.chapter;
    if (this.verse) {
      tmpString += ':' + this.verse;
    }
    return tmpString;
  }

  // Get the verse id for this reference
  public toVerseId(): number {
    let verseCount = 0;
    let bookIndex = this.book - 1;
    while (bookIndex >= 1) {
      verseCount += Reference.versesInBookId(bookIndex);
      bookIndex -= 1;
    }
    var chapterIndex = this.chapter - 1;
    while (chapterIndex >= 1) {
      verseCount += Reference.versesInBookId(bookIndex);
      verseCount += books[this.book - 1].verses[chapterIndex];
    }
    if (this.verse != null) {
      verseCount += this.verse;
    }
    return verseCount;
  }

  // Get the chapter id for this reference
  public toChapterId(): number {
    const previousBookChapters = Reference.chaptersUpToBookId(this.book);
    return previousBookChapters + this.chapter;
  }

  // Get the book id for this reference
  public toBookId(): number {
    return this.book;
  }

  // When doing math, use verse id as the value
  public valueOf(): number {
    return this.toVerseId();
  }
}

export default Reference;
