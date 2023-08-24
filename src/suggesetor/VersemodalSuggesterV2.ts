import { App, DropdownComponent, Modal, SuggestModal, TextComponent, ToggleComponent } from "obsidian";
import { VerseSuggesting } from "src/VerseSuggesting";
import { BibleVersionCollection } from "src/data/BibleVersionCollection";
import { BibleReferencePluginSettings } from "src/data/constants";
import { IBibleVersion } from "src/interfaces/IBibleVersion";


export class VerseModalSuggesterV2 extends Modal {
    settings: BibleReferencePluginSettings

    constructor(app: App, settings: BibleReferencePluginSettings) {
        super(app)
        this.settings = settings
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
        const { contentEl } = this

        const referenceTextBoxDiv = contentEl.createDiv()
        referenceTextBoxDiv.createEl('div', {text: 'Verse Reference:', cls: 'modal-contents'})
        new TextComponent (referenceTextBoxDiv)
            .setPlaceholder('Gen1:1')

        const translationSelecterDiv = contentEl.createDiv()
        translationSelecterDiv.createEl('div', {text: 'Select Translation:', cls: 'modal-contents'})
        new DropdownComponent (translationSelecterDiv)
            .addOptions(this.formatVersionsIntoObject())
            .setValue(this.settings.bibleVersion)

        const includeTranslationInReferenceDiv = contentEl.createDiv()
        includeTranslationInReferenceDiv.createEl('div', {text: 'Include Translation in the Reference:', cls: 'modal-contents'})
        new ToggleComponent (includeTranslationInReferenceDiv)
            .setValue(false)
    }

    onClose() {
        const { contentEl } = this
        contentEl.empty()
    }
    

}