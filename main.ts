import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { APP_SETTINGS, BibleReferencePluginSettings, DEFAULT_SETTINGS } from './src/constants';
import { BibleReferenceSettingTab } from './src/BibleReferenceSettingTab';
import { BibleReferenceModal } from './src/BibleReferenceModal';


export default class BibleReferencePlugin extends Plugin {
  settings: BibleReferencePluginSettings;

  async onload() {
    console.log('loading plugin -', APP_SETTINGS.appName);

    await this.loadSettings();

	// This creates an icon in the left ribbon.
	const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
	  // Called when the user clicks the icon.
	  new Notice('This is a notice!');
	});
	// Perform additional things with the ribbon
	ribbonIconEl.addClass('my-plugin-ribbon-class');

	// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
	const statusBarItemEl = this.addStatusBarItem();
	statusBarItemEl.setText('Status Bar Text');

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

	  // This adds a simple command that can be triggered anywhere
	  this.addCommand({
		  id: 'open-sample-modal-simple',
		  name: 'Open sample modal (simple)',
		  callback: () => {
			  new BibleReferenceModal(this.app).open();
		  }
	  });
	  // This adds an editor command that can perform some operation on the current editor instance
	  this.addCommand({
		  id: 'sample-editor-command',
		  name: 'Sample editor command',
		  editorCallback: (editor: Editor, view: MarkdownView) => {
			  console.log(editor.getSelection());
			  editor.replaceSelection('Sample Editor Command');
		  }
	  });
	  // This adds a complex command that can check whether the current state of the app allows execution of the command
	  this.addCommand({
		  id: 'open-sample-modal-complex',
		  name: 'Open sample modal (complex)',
		  checkCallback: (checking: boolean) => {
			  // Conditions to check
			  const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
			  if (markdownView) {
				  // If checking is true, we're simply "checking" if the command can be run.
				  // If checking is false, then we want to actually perform the operation.
				  if (!checking) {
					  new BibleReferenceModal(this.app).open();
				  }

				  // This command will only show up in Command Palette when the check function returns true
				  return true;
			  }
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
