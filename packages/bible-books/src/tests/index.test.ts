import books from '../index';

describe('test book names', () => {
  test('books count is 66', () => {
    expect(books.length).toBe(66);
  });
});

//todo add more
