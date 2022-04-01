import { IBibleVersion } from '../interfaces/IBibleVersion';
import { BibleAPIDotComProvider } from './BibleAPIDotComProvider';
import { BibleProvider } from './BibleProvider';

/**
 * A factory for Bible API providers.
 * To create provider instance and decide which provider to use.
 */
export class BibleAPIFactory {
  // define a single instance of BibleAPIFactory
  private static _instance: BibleAPIFactory;

  // private constructor
  private constructor() {
    if (BibleAPIFactory._instance) {
      throw new Error('Error: Instantiation failed: Use BibleAPIFactory.Instance instead of new.');
    }
    BibleAPIFactory._instance = this;
  }

  // get instance of BibleAPIFactory
  public static get Instance(): BibleAPIFactory {
    if (BibleAPIFactory._instance === null || BibleAPIFactory._instance === undefined) {
      BibleAPIFactory._instance = new BibleAPIFactory();
    }
    return BibleAPIFactory._instance;
  }

  /**
   * Get the bible api provider from bible version selected
   * @param bibleVersion
   * @constructor
   */
  public BuildBibleVersionAPIAdapterFromIBibleVersion(bibleVersion: IBibleVersion): BibleProvider {
    if (bibleVersion.apiUrl === 'https://bible-api.com') {
      return new BibleAPIDotComProvider(bibleVersion);
    }
    return null;
  }
}
