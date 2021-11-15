## Obsidian Bible Reference
- Taking Bible Study note in Obsidian.md application easily.
- Automatically suggesting Bible Verses as references.

![obsidian bible reference demo](https://raw.githubusercontent.com/tim-hub/obsidian-bible-reference/master/demo/obsidian-bible-reference-demo.gif)

## How to use
1. Open the note in Obsidian.md application
2. In a note, for example type `--John1:1`
3. Select the suggestion

## How to install
> This plugin Bible Verse Query Functionality is powered by [bible-api.com](https://bible-api.com/) (World English Bible version).
> The back-end API might be changed in the future to support different languages and versions.

1. On the Obsidian's settings page,
2. Browse the community plugins and search `Bible Reference`
3. Then install and enable it

## Development and Contribution
- Typescript/Node Development Experience
- [Hot reload plugin](https://github.com/pjeby/hot-reload) (optional, but it isvery handy for development purpose)
- [Obsidian Plugin Development](CONTRIBUTION.md)


### References
- inspired by [obsidian emoji shorcodes](https://github.com/phibr0/obsidian-emoji-shortcodes)
- [upstream](https://github.com/obsidianmd/obsidian-sample-plugin) is template repo as obsidian sample plugin

- Bible Source
  - [bible db sqlite](https://github.com/tim-hub/bible_databases)
    - [find bible verse](https://github.com/tim-hub/FindBibleVerse) in development, this is a local node package for querying bible version
  - [bible api](https://bible-api.com/) Ruby web app that serves JSON API for open and public domain bibles WEB version, Web Engilish Bible

