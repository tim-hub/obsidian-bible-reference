# Plugin API
`obsidian-bible-reference` provides a globally accessible API which other plugins and tools can use to query and render bible verses. Many thanks to [obsidian-dataview](https://github.com/blacksmithgu/obsidian-dataview) for this idea. This API is accessible either via:

```js
// Either:
const OBRAPI = window.app.plugins.plugins["obsidian-bible-reference"].api;

// Or:
const OBRAPI = window.BibleReferenceAPI;
```

## Functions

### `BibleReferenceAPI#queryVerses()`
Lookup verses for a given reference, with optional overrides for default parameters.
```
async queryVerses(query: string, opts?: BibleReferencePluginSettings): Promise<VerseSuggesting | null>
```
#### Example
From the developer console (ctrl+shift+i):
```
(await window.BibleReferenceAPI.queryVerses("John 3:16", { bibleVersion: "ESV" })).allFormattedContent;
// Returns:
// ' [!bible] [John 3:16 - ESV](https://bolls.life/ESV/43/3/)\n' +
// '> 16. “For God so loved the world,  that he gave his only Son, that whoever believes in him should not perish but have eternal life.\n\n'
```

## Using With Other Plugins
If you are using [SilentVoid13's templater](https://github.com/SilentVoid13/Templater) -- you can create a template for "bible study notes" like as follows:

```
<%*
const BRAPI = window.BibleReferenceAPI;

const reference = await tp.system.prompt("Verses","", true);
const version = await tp.system.prompt("Version",BRAPI.settings.bibleVersion);

const verses = await BRAPI.queryVerses(reference, { bibleVersion: version });

if ( !verses  ) throw new Error("Cannot parse verses");
_%>

<% tp.file.rename("Notes on " + reference.replace(/:/g,".")) _%>
---
creation: <% tp.date.now("YYYY-MM-DD") %>
text: <% reference %>
---
# <% "Notes on: " + reference %>

## Text
<% verses.allFormattedContent -%>

## Notes
```
