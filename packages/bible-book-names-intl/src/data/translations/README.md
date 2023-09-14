This is the source of Bible books names in different languages.

- it includes all 66 books of the Bible
- it includes books names and abbreviations

It is in this structure 

```json
{
  "language": "en", // language code
  "1": { // the book index, 1 is Genesis
    "name": "Genesis", // the book name
    "shortNames": ["Gen"], // the book abbreviation
    "startNumber": 0, // the start number of the book, most of books does not have this, leave it empty or 0, but some books like Timothy has 1 and 2, so we need to set it to 1/2
  },
  // more ...
  "9": {
    "name": "Samuel",
    "shortNames": [
      "Sa",
      "Sam"
    ],
    "startNumber": 1
  },
  "10": {
    "name": "Samuel",
    "shortNames": [
      "Sa",
      "Sam"
    ],
    "startNumber": 2
  },
  // more ...
}
```

Please follow this structure to add more books names in different languages.