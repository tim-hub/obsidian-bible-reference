import fs from 'fs';
import path from 'path';

export const generateOrdinalNameVariations = (
  startNumber: number,
  names: string[]
): string[] => {
  const variations: string[] = [];
  let numerals: string[];
  if (startNumber === 1) {
    numerals = ['1', 'I', 'First'];
  } else if (startNumber === 2) {
    numerals = ['2', 'II', 'Second'];
  } else if (startNumber === 3) {
    numerals = ['3', 'III', 'Third'];
  }
  names.forEach((name) => {
    numerals.forEach(function (numeral: string) {
      variations.push(numeral + name);
      variations.push(numeral + ' ' + name);
    });
  });
  return variations;
};