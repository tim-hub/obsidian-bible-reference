import { EditorSuggest } from 'obsidian';


export class VerseEditorVerseOfDaySuggester extends EditorSuggest<any> {
  getSuggestions(context: EditorSuggestContext): any[] | Promise<any[]> {
    return undefined;
  }

  onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
    return undefined;
  }

  renderSuggestion(value: any, el: HTMLElement): void {
  }

  selectSuggestion(value: any, evt: MouseEvent | KeyboardEvent): void {
  }

  renderSuggestion(value: any, el: HTMLElement): void {
  }

  selectSuggestion(value: any, evt: MouseEvent | KeyboardEvent): void {
  }

}
