import Reference from '../lib/reference';
import Range from '../lib/range';
describe('test range', () => {
  let start = new Reference('Genesis 1:1');
  let end = new Reference('Exodus 1:1');
  let range = new Range(start, end);
  beforeEach(() => {
    range = new Range(start, end);
  });

  test('range is define properly', () => {
    expect(Range.isRange(range)).toBe(true);
  });

  test('distance() returns the distance between the References', () => {
    let distance = range.distance();
    expect(distance.books).toBe(1);
    expect(distance.chapters).toBe(50);
    expect(distance.verses).toBe(1533);
  });
});
