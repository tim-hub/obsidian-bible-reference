import { Modal } from 'obsidian'
import BibleReferencePlugin from '../main'
import { getVod } from '../provider/VODProvider'
import { BibleReferencePluginSettings } from '../data/constants'
import { EventStats } from '../provider/EventStats'

export class VerseOfDayModal extends Modal {
  constructor(
    plugin: BibleReferencePlugin,
    private settings: BibleReferencePluginSettings
  ) {
    super(plugin.app)
  }

  onClose() {
    super.onClose()
    const { contentEl } = this
    contentEl.empty()
  }

  async onOpen() {
    super.onOpen()
    const { contentEl } = this
    const item = await getVod()
    contentEl.setText(`${item.verse.details.text}
-- ${item.verse.details.reference}    
    `)
    EventStats.logLookup(
      'vodLookUp',
      { key: `${this.settings.bibleVersion}-vod`, value: 1 },
      this.settings.optOutToEvents
    )
  }
}
