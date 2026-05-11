# Obsidian Bible Reference — Plans.md

Last release: see `manifest.json` / `versions.json`

---

## Phase 1: Fix unrecognized book abbreviations (Sng, etc.)

Created: 2026-05-12

**Goal**: Make common Bible book abbreviations from the plugin's own `src/data/abbreviations.ts` (e.g. `Sng`, `Exo`, `Kgs`) resolve correctly when users type them as input (e.g. `--Sng1:1`). Today these fail with "no book matched X" because `getBookIdFromBookName` delegates straight to `bible-reference-toolkit`, which does not recognize all of the abbreviations listed in this plugin's own data. The dormant `ALL_BOOKS` constant in `abbreviations.ts` (already flagged with a `todo consider ... use this` comment) becomes the canonical local fallback.

**Non-goals**:
- Adding new language coverage. Only English alias resolution is in scope.
- Reworking the suggestion UI or the regex grammar (`BOOK_REG` / `BOOK_VERSE_REG`).

| Task | Description | DoD | Depends | Status |
|------|-------------|-----|---------|--------|
| 1.1 | Add failing test in `src/utils/bookNameReference.test.ts` asserting `getBookIdFromBookName('Sng')` returns `22` (Song of Solomon) and `getFullBookName('Sng', 'en')` returns `'Song of Solomon'`. Include one more representative case from `ALL_BOOKS` that the library does not recognize (pick by running the existing test once and noting any other failures). | Running `pnpm jest src/utils/bookNameReference.test.ts` shows the new cases failing for the documented reason (library throws). | - | cc:TODO |
| 1.2 | Build a `LOCAL_ALIAS_TO_CANONICAL` map (English-only) derived from `ALL_BOOKS` in `src/data/abbreviations.ts`: for each entry, map every alias (case-insensitive, trimmed) to the canonical `name`. Export from a new file `src/utils/localBookAliases.ts` (keep `abbreviations.ts` untouched to preserve the BLB/StepBible data it owns). | New file exists, exports a `Readonly<Record<string, string>>` keyed by lowercase alias, with `'sng' → 'Song of Solomon'`. Type-check passes: `pnpm tsc -noEmit -skipLibCheck`. | - | cc:TODO |
| 1.3 | Modify `getBookIdFromBookName` in `src/utils/bookNameReference.ts` so the second `catch` branch tries `Reference.bookIdFromName(LOCAL_ALIAS_TO_CANONICAL[name.toLowerCase().trim()] ?? name)` before re-throwing. Order: (a) translation+name, (b) any-translation name, (c) local-alias-normalized name. No behavior change for inputs the library already handles. | All previous tests in `bookNameReference.test.ts` still pass. New tests from 1.1 now pass. `--Sng1:1` typed in dev produces a Song of Solomon suggestion (manual check in Obsidian against `OUT_DIR=<vault>/.obsidian/plugins/... pnpm dev`). | 1.1, 1.2 | cc:TODO |
| 1.4 | Run the full test suite once to catch regressions in `verseMatch`, `splitBibleReference`, and any snapshot suggester tests. Fix only regressions introduced by 1.3. | `pnpm test` exits 0. No unrelated test edits. | 1.3 | cc:TODO |
| 1.5 | Update README + (if present) a short note in `docs/code-patterns.md` listing the now-recognized aliases for Song of Solomon and the general rule ("any alias in `ALL_BOOKS` is now valid input"). Do **not** advertise inputs the library still does not match — verify each example by hand. | README change shows working examples; no example in README returns an error when typed in a dev vault. | 1.3 | cc:TODO |
| 1.6 | Open an issue (or PR if straightforward) against `bible-reference-toolkit` / `bible-book-names-intl` on GitHub reporting the missing English aliases identified in 1.1 (e.g. `Sng` for Song of Solomon). Include the failing cases, expected vs. actual behaviour, and a reference to this plugin as a real-world consumer. If a PR is viable, attach the alias additions; otherwise leave as an issue and link it in `docs/bible-api-and-source.md`. | A GitHub issue or PR URL exists and is reachable. `docs/bible-api-and-source.md` contains a note linking to it. | 1.1 | cc:TODO |

---

## Future Considerations

- Once 1.2's local map is in place, evaluate deleting the `// This is not used so far` comment block in `src/data/abbreviations.ts:1-5` and consolidating `ALL_BOOKS` + `BLB_BOOK_CODES` + `STEPBIBLE_BOOK_CODES` into one source-of-truth structure. Out of scope here — only worth doing if a second fix touches the same area.
- Consider whether `--songofsongs1:1` (no spaces, lowercase) should also resolve. That requires a different change (space-insensitive matcher in `BOOK_REG`) and is deliberately deferred.

---

## Archive

- Last archive: (none)
