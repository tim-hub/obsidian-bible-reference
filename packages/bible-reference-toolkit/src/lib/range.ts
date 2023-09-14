import Reference, { IReference } from './reference';

export class Range {
  private start: Reference;
  private end: Reference;

  constructor(start: IReference, end: IReference) {
    this.start = new Reference(start);
    this.end = new Reference(end);
    // Ensure we got the ordering right
    if (start > end) {
      this.start = new Reference(end);
      this.end = new Reference(start);
    }
  }

  public distance(): { verses: number; chapters: number; books: number } {
    return {
      verses: this.end.toVerseId() - this.start.toVerseId(),
      chapters: this.end.toChapterId() - this.start.toChapterId(),
      books: this.end.toBookId() - this.start.toBookId(),
    };
  }

  public static isRange(value: any): boolean {
    return value instanceof Range || value?.indexOf('-') > -1;
  }
}

export default Range;
