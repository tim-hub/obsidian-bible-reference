export interface IVersion {
  id: string;
  name: string;
}

export interface IBibleLanguageToVersions {
  id: string;
  name: string;
  versions: IVersion[];
}

export const BibleLanguageToVersionsCollection: IBibleLanguageToVersions[] = [
  {
    id: 'en',
    name: 'English',
    versions:
      [
        {
          id: 'web',
          name: 'World English Bible',
        },
        {
          id: 'kjv',
          name: 'King James Version',
        },
      ],
  },
  {
    id: 'latin',
    name: 'Latin',
    versions: [
      {
        id: 'clementine',
        name: 'Clementine Latin Vulgate',
      },
    ]
  },
];
