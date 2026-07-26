import Reference from "../lib/reference";

describe("Reference get book id from name", () => {
  test("Get Book Id from Book Name", () => {
    expect(Reference.bookIdFromName("Genesis")).toBe(1);
  });

  test("Get Book Id From Book Name For English", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "Genesis")).toBe(1);
  });

  test("Get Book Id for 1 Timothy", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "1 Timothy")).toBe(54);
  });

  test("Get Book Id for 1 Tim", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "1Tim")).toBe(54);
  });

  test("Get Book Id for 2 Timothy", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "2 Timothy")).toBe(55);
  });

  test("Get Book Id for 3 John", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "3 John")).toBe(64);
  });

  describe("get book name from id with books start with number", () => {
    test("Get Book Id from Book Name", () => {
      expect(Reference.bookIdFromName("1 Timothy")).toBe(54);
    });
  });
});

describe("Reference Original Test in Other Languages", () => {
  test("Get Book Id From Book Name For Spanish", () => {
    expect(Reference.bookIdFromTranslationAndName("sp", "Génesis")).toBe(1);
  });

  test("Get Book Id From Book Name For Spanish With Short Name", () => {
    expect(Reference.bookIdFromTranslationAndName("sp", "gn")).toBe(1);
  });

  test("Get Book Id for 3 John in Japanese", () => {
    expect(Reference.bookIdFromTranslationAndName("jp", "ヨハネの手紙三")).toBe(
      64,
    );
  });

  test("Get Book Name from Book Id in JP", () => {
    expect(Reference.bookNameFromTranslationAndId("jp", 64)).toBe(
      "ヨハネの手紙三",
    );
  });

  test("Get Book Name from Book Id in Spain", () => {
    expect(Reference.bookNameFromTranslationAndId("sp", 62)).toBe("1 Juan");
  });
});

// Regression: localized numbered books must resolve through the cross-language
// bookIdFromName fallback, not only per-translation lookup. The provider maps a
// localized name to English via this path, so failure here dropped the verse
// text (issues #355, #342).
describe("Cross-language numbered book resolution (bookIdFromName)", () => {
  test.each([
    ["1 Könige", 11],
    ["1Könige", 11],
    ["1 Reyes", 11],
    ["2 Corintios", 47],
    ["1 Corinthians", 46],
    ["1 Kings", 11],
  ])("resolves %s", (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId);
  });
});

// The string constructor has always stripped the periods abbreviations are
// written with ("Mk. 2"). The static lookups did not, so the plugin - which
// calls them directly - could not resolve any dotted abbreviation.
describe("Abbreviations written with a period", () => {
  test.each([
    ["Eph.", 49],
    ["Matt.", 40],
    ["Gen.", 1],
    ["Mk.", 41],
    ["1 Cor.", 46],
    ["2 Tim.", 55],
    ["1 Jn.", 62],
  ])("resolves %s", (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId);
  });

  test("resolves through the per-translation lookup too", () => {
    expect(Reference.bookIdFromTranslationAndName("en", "Eph.")).toBe(49);
  });

  test("collapses whitespace runs around the ordinal", () => {
    expect(Reference.bookIdFromName("1  Cor.")).toBe(46);
    expect(Reference.bookIdFromName("  1 Cor.  ")).toBe(46);
  });
});

describe("Multi-word book names", () => {
  test.each([
    ["Song of Solomon", 22],
    ["Song of Songs", 22],
  ])("resolves %s", (name, expectedId) => {
    expect(Reference.bookIdFromName(name)).toBe(expectedId);
  });
});
