## How to Add More Languages
> Add abbreviation of Bible books names in different languages.

This folder is the source of Bible Book names and abbreviations in different languages.


### Structure of the JSON file
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

- it includes all 66 books of the Bible
- it includes books names and abbreviations
- if there is no abbreviation for the book, leave short names can be empty array (do not keep it as the same as the book name)
- books short names (abbreviations) have to be unique to each other.


Please follow this structure to add more books names in different languages.