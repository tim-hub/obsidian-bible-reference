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
`localizedBookName` for display, `bookIdForVersion` for the API path. The
English-vs-version-specific decision and the English fallback live here, once —
callers pass a Version, not a raw locale string.

**Verse-text localization** — comes from Version selection → `apiSource` → provider,
not from `code`. `code` affects book-name display only.

**Locale reconciliation** — the invariant that every version `code` either matches a
catalog (`SupportedLanguages`) or is a known English-fallback code. Enforced by
`data/bookNameLocaleReconciliation.test.ts` so a `code`/catalog drift (e.g. an
uppercase `zh_TW`) fails CI instead of silently anglicizing book names. Codes with
no catalog live in that test's `ENGLISH_FALLBACK`; catalogs with no version live in
`CATALOGS_WITHOUT_VERSION` (currently `da`, `jp`).
