# Domain model

Ubiquitous language for this project. Keep terms here consistent with the code.

## Bible-content localization

**Version** — a specific Bible edition the user selects (e.g. `cuv` Chinese Union
Version). Identified by `key`; carries a `language`, an `apiSource`, and a `code`.
Persisted in settings as its `key`. See `data/BibleVersionCollection.ts`.

**Book-name locale** — the catalog language a version's book names are rendered in
(the `code` field on a Version, e.g. `zh_tw`, `zh_cn`, `en`). Distinct from the
version `key` and from the API's own language. **Must be lowercase**: the toolkit
lowercases every lookup (`bible-reference-toolkit` `reference.ts` `toLowerCase()`),
so a locale key must match its catalog key after lowercasing. Book-name catalogs
live in `bible-book-names-intl/src/data/translations/*.json`, keyed by their
`language` field.

**Book-name localization** — turning `(rawBookName, version, bookNameLanguage setting)`
into a displayed book name, and a localized name back into a book id for API URLs.
Owned by the `bookNameLocalization` module (`utils/bookNameLocalization.ts`):
`localizedBookName(bookId, version, setting)` for display. The
English-vs-version-specific decision and the English fallback live here, once —
callers pass a Version and a book id, not a raw locale string or a name.

**Book id** — the canonical 1–66 number of a book (Protestant order). Resolved
once from the typed name by `splitBibleReference` and carried on
`VerseReference.bookId`; every later step (verse counts, verse lookup, links,
offline text) works from the id, and names are produced from it only for display.

**Verse lookup** — fetching the text of a passage for a Version. Owned by
`provider/verseLookup.ts`: `lookupVerses(version, passage)` (verse cache, fetch
of the missing verses, bundled-WEB fallback) and `sourceUrlFor(version, passage)`
(the "original" link).

**Verse source** — one Bible API behind the verse lookup (bible-api.com, Bolls
Life, Bible SuperSearch). Each is a stateless `VerseSource` adapter: request URL,
source URL, response parsing. The bundled offline Version is not a verse source;
the verse lookup reads it directly.

**Verse-text localization** — comes from Version selection → `apiSource` → provider,
not from `code`. `code` affects book-name display only.

**Locale reconciliation** — the invariant that every version `code` either matches a
catalog (`SupportedLanguages`) or is a known English-fallback code. Enforced by
`data/bookNameLocaleReconciliation.test.ts` so a `code`/catalog drift (e.g. an
uppercase `zh_TW`) fails CI instead of silently anglicizing book names. Codes with
no catalog live in that test's `ENGLISH_FALLBACK`; catalogs with no version live in
`CATALOGS_WITHOUT_VERSION` (currently `da`, `jp`).
