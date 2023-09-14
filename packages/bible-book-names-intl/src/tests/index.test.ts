import books from '../index';

describe('test book names', () => {
  test('books count is 66', () => {
    expect(books.length).toBe(66);
    expect(new Set(books[0].names).size).toBe(books[0].names.length)
    expect(books[0].names[0]).toBe('Genesis')
  });
});

//todo add more
