import { Notice, Plugin } from 'obsidian';
import { APP_SETTINGS, BibleReferencePluginSettings, DEFAULT_SETTINGS } from './src/constants';
import { BibleReferenceSettingTab } from './src/BibleReferenceSettingTab';
import { BibleReferenceModal } from './src/BibleReferenceModal';


export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings;

  async onload() {
    console.log('loading plugin -', APP_SETTINGS.appName);

    await this.loadSettings();

    this.addRibbonIcon('dice', APP_SETTINGS.appName, () => {
      new Notice('This is a notice!');
    });

    this.addStatusBarItem().setText(APP_SETTINGS.defaultStatus);

    this.addCommand({
      id: 'open-bible-reference-modal',
      name: 'Open Bible Reference Modal',
      // callback: () => {
      // 	console.log('Simple Callback');
      // },
      checkCallback: (checking: boolean) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            new BibleReferenceModal(this.app).open();
          }
          return true;
        }
        return false;
      }
    });

    this.addSettingTab(new BibleReferenceSettingTab(this.app, this));

    // this.registerEvent();

    this.registerCodeMirror((cm: CodeMirror.Editor) => {
      // console.log('codemirror', cm);
      cm.on('change', (
        cmEditor: CodeMirror.Editor,
        changeObj: CodeMirror.EditorChange
      ):boolean => {
        console.log('codemirror changed');
        return true;
      });
    });

    // this.registerCodeMirror((cm: CodeMirror.Editor) => {
    //   cm.off("change", (cmEditor: CodeMirror.Editor,
    //                     changeObj: CodeMirror.EditorChange) => {
    //     console.log('codemirror changed');
    //   });
    // });

    // this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
    //   console.log('click', evt);
    // });

    // this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
  }

  onunload() {
    console.log('unloading plugin', APP_SETTINGS.appName);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
