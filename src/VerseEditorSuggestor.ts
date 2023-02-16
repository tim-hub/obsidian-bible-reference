import {
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";
import BibleReferencePlugin from "./main";
import { VerseTypoCheck } from "./VerseTypoCheck";
import { VerseSuggesting } from "./VerseSuggesting";
import { BibleReferencePluginSettings } from "./data/constants";
import { getSuggestionsFromQuery } from "./suggesetor/VerseSuggestor";

/**
 * Extend the EditorSuggest to suggest bible verses.
 */
export class VerseEditorSuggestor extends EditorSuggest<VerseSuggesting> {
  plugin: BibleReferencePlugin;
  settings: BibleReferencePluginSettings;

  constructor(
    plugin: BibleReferencePlugin,
    settings: BibleReferencePluginSettings
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.settings = settings;
  }

  /**
   * This will build the EditorSuggestContext in getSuggestions
   * @param cursor
   * @param editor
   * @param _
   */
  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
    _: TFile
  ): EditorSuggestTriggerInfo | null {
    const currentContent = editor.getLine(cursor.line).substring(0, cursor.ch);
    const match = VerseTypoCheck(currentContent);
    if (match) {
      console.debug("trigger on", currentContent);
      return {
        end: cursor,
        start: {
          line: cursor.line,
          ch: currentContent.lastIndexOf(match),
        },
        query: match,
      };
    }
    return null;
  }

  /**
   * Suggest bible verses.
   * @param context
   */
  async getSuggestions(
    context: EditorSuggestContext
  ): Promise<VerseSuggesting[]> {
    return getSuggestionsFromQuery(context.query, this.settings);
  }

  renderSuggestion(suggestion: VerseSuggesting, el: HTMLElement): void {
    suggestion.renderSuggestion(el);
  }

  selectSuggestion(suggestion: VerseSuggesting): void {
    if (this.context) {
      (this.context.editor as Editor).replaceRange(
        suggestion.ReplacementContent,
        this.context.start,
        this.context.end
      );
    }
  }
}
