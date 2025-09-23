import { Modal } from 'obsidian'
import BibleReferencePlugin from '../main'
import { getEnhancedVod } from '../provider/VODProvider'
import { BibleReferencePluginSettings } from '../data/constants'

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
    const item = await getEnhancedVod(this.settings.defaultBibleVersion)

    // Use enhanced verse text if available, otherwise fall back to NIV
    const text = item.enhancedVerse
      ? item.enhancedVerse.map((v) => v.text).join(' ')
      : item.verse.details.text

    const version = item.userVersion || item.verse.details.version

    contentEl.setText(`${text}
-- ${item.verse.details.reference} (${version})    
    `)
  }
}
