import { IVerse } from './IVerse';

// define the interface of VerseSuggesting class
export interface IVerseSuggesting {

  getVerses(text: string): Promise<IVerse[]>;
  fetchAndSetVersesText(): Promise<void>;
}
