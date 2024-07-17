import { BibleReferencePluginSettings } from '../data/constants'
import { VerseSuggesting } from '../verse/VerseSuggesting'
import { verseMatch } from '../utils/verseMatch'
import { getSuggestionsFromQuery } from '../utils/getSuggestionsFromQuery'

/**
 * A subset of the plugin's API, to be exposed globally for programmatic use
 *
 * Available via: `app.plugins.plugins['obsidian-bible-reference'].api` or globally as (i.e. on window) `BibleReferenceAPI`
 *
 * Many thanks to `obsidian-dataview` for the implementation reference
 */
export class BibleReferenceAPI {
  settings: BibleReferencePluginSettings
  
  public constructor(
    public app: App,
    public settings: BibleReferencePluginSettings
  ) {
    this.settings = settings;
  }

  private mergeSettings(opts?: BibleReferencePluginSettings): BibleReferencePluginSettings {
    return opts
      ? Object.assign(Object.assign({}, this.settings), opts)
      : Object.assign({}, this.settings);
  }

  /**
   * Lookup verses from a string
   *
   * Adapted from `VerseLookupSuggestModal#getSuggestions`
   *
   * @param {String} query - the query string (e.g. 'Luke 1:1')
   * @param {BibleReferencePluginSettings?} [opts=undefined] - optional overrides for any settings
   */
  async queryVerses(query: string, opts?: BibleReferencePluginSettings): Promise<VerseSuggesting | null> {
    if ( !verseMatch(query) ) return null;
    return getSuggestionsFromQuery(`${query}`, this.mergeSettings(opts)).then(verseArray => verseArray[0] || null);
  }
}
