import { IBibleApiSource } from './IBibleApiSource';

export interface IBibleVersion {
  key: string;
  versionName: string;
  language: string;
  apiSource: IBibleApiSource;
  infoUrl?: string;
  apiUrl?: string; //deprecated
}
