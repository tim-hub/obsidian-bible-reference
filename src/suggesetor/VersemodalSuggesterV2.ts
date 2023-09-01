import { App, Modal, Setting } from "obsidian";
import { BibleVersionCollection } from "src/data/BibleVersionCollection";
import { BibleReferencePluginSettings } from "src/data/constants";
import { IBibleVersion } from "src/interfaces/IBibleVersion";
import BibleReferencePlugin from "src/main";
import { BibleReferenceSettingTab } from "src/ui/BibleReferenceSettingTab";


export class VerseModalSuggesterV2 extends Modal {
    settings: BibleReferencePluginSettings
    plugin: BibleReferencePlugin
    constructor(app: App, settings: BibleReferencePluginSettings, plugin: BibleReferencePlugin) {
        super(app)
        this.settings = settings
        this.plugin = plugin
    }

    getAllBibleVersionsWithLanguageNameAlphabetically = (): IBibleVersion[] => {
        return BibleVersionCollection.sort((a, b) => {
            // sort by language and versionName alphabetically
            const languageCompare = a.language.localeCompare(b.language)
            if (languageCompare === 0) {
                return a.versionName.localeCompare(b.versionName)
            } else {
                return languageCompare
            }
        })
    }

    formatVersionsIntoObject = () => {
        const allVersionOptions = this.getAllBibleVersionsWithLanguageNameAlphabetically()
        const obj: {[k: string]: string} = {};
        
        allVersionOptions.forEach((version: IBibleVersion) => {
            obj[version.key] = `${version.language} - ${version.versionName}`
        })
        return obj
    }

    onOpen() {
        this.modalEl.style.width = 'auto'
        const { contentEl } = this
        contentEl.createEl('h3', {text: 'Insert Verse'})
        const settingsInModal = new BibleReferenceSettingTab(this.app, this.plugin)

        // Verse Text Box
        const referenceTextBox = new Setting(contentEl)
            .setName("Enter Verse Reference:")
            .addText((text) => text
                .setPlaceholder('Genesis 1:1')
                .onChange(async (string) =>{
                    // Get verses from reference
                }))
        
        // Version Selecter
        settingsInModal.SetUpVersionSettingsAndVersionOptions(contentEl)
        
        // Toggle Version in Reference
        const versionInReference = new Setting(contentEl)
            .setName('Include Bible Version in Reference')
            .setDesc('Include or exclude the Bible translation in the verse citation')
            .addToggle((toggle) => toggle.setValue(false))

        // Verse Number Format
        settingsInModal.SetUpVerseNumberFormatOptions(contentEl)
    }

    onClose() {
        const { contentEl } = this
        contentEl.empty()
    }
    

}
