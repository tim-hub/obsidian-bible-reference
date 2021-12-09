import { App, Modal } from 'obsidian';

export class BibleReferenceModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let {contentEl} = this;
    contentEl.setText('Woah!');
  }

  onClose() {
    let {contentEl} = this;
    contentEl.empty();
  }
}
