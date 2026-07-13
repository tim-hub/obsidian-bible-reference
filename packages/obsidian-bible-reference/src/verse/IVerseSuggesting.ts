import { IVerse } from '../interfaces/IVerse'

// define the interface of VerseSuggesting class
export interface IVerseSuggesting {
  /**
   * Consume remote api to get verses
   */
  getVerses(): Promise<IVerse[]>

  /**
   * Save the verses that could be used in the main content
   */
  fetchAndSetVersesText(): Promise<void>
}
