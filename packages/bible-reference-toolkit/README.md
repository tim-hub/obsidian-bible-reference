# Bible Reference Toolkit


[![CodeQL](https://github.com/tim-hub/bible-reference-toolkit/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/tim-hub/bible-reference-toolkit/actions/workflows/codeql-analysis.yml)

Bible Reference Toolkit is a JavaScript/Typescript package for handling Bible references. It can:

- parse textual references into a standard, index based format
- convert a textual reference to an absolute verse number
- convert an absolute verse number to its textual reference
- handle chapter references
- handle ranges (e.g. John 3:1-16) (WIP)

# Installation

npm install --save bible-reference-toolkit

# Usage

The `bible-reference-toolkit` module exposes three top level exports:

```
  import Bible from 'bible-reference-toolkit';
  let reference = Bible.Reference // A class representing a single verse or chapter
  let range = Bible.Range // A class representing a range of verses
  let books = Bible.Books // A reference array containing data on the names and number of chapters/verses for each book in the Bible
```

- see more at [wiki](https://github.com/tim-hub/bible-reference-toolkit/wiki)
