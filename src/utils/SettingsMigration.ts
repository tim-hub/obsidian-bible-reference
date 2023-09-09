import { Notice } from "obsidian";
import { BibleVerseReferenceLinkPosition } from "src/data/BibleVerseReferenceLinkPosition";
import { BibleReferencePluginSettings } from "src/data/constants";

export function migrateSettings(settings: BibleReferencePluginSettings) {
  let newHeadFormat: string[] = ['>']
  let newTailFormat: string[] = ['>']

  if(settings.collapsibleVerses) {
    newHeadFormat.push('[!Bible]-')
  } else {
    newHeadFormat.push('[!Bible]')
  }

  new Notice('Migrating reference link settings...')
  if (settings.referenceLinkPosition ===
      BibleVerseReferenceLinkPosition.Header ||
    settings.referenceLinkPosition ===
      BibleVerseReferenceLinkPosition.AllAbove) {
    newHeadFormat.push('{{verse_reference}}')
  }
  if (settings.referenceLinkPosition ===
      BibleVerseReferenceLinkPosition.Bottom ||
    settings.referenceLinkPosition ===
      BibleVerseReferenceLinkPosition.AllAbove) {
    newTailFormat.push('{{verse_reference}}')
  }

  new Notice('Migrating tagging settings...')
  if (
    this.settings?.bibleTagging ||
    this.settings?.bookTagging ||
    this.settings?.chapterTagging) {
    newTailFormat.push('%%')
    newTailFormat.push((this.settings?.bibleTagging) ? '#bible' : '')
    newTailFormat.push((this.settings?.bookTagging) ? `#${this.bookName}` : '')
    newTailFormat.push((this.settings?.chapterTagging) ? `#${this.bookName+this.chapterNumber}` : '')
    newTailFormat.push('%%')
  }

  settings.formatString = newHeadFormat.join(' ') + '\n{{content}}\n' + newTailFormat.join(' ')
}

export function autoMigrate(settings: BibleReferencePluginSettings) {
  settings.autoMigrate = false
  migrateSettings(settings)
  new Notice('Automatically migrated old settings.  If this is your first time using the plugin, ignore this message.')
}
